import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/authenticate.js';
import { getSupabaseConfig } from '../config/supabase.js';

const router = Router();
const audioExtensions = /\.(mp3|mp4|mpeg|mpga|m4a|wav|webm|ogg|flac)$/i;
const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    if (file.mimetype.startsWith('audio/') || audioExtensions.test(file.originalname)) {
      callback(null, true);
      return;
    }
    const error = new Error('Vui lòng tải lên tệp âm thanh được hỗ trợ.');
    error.status = 400;
    callback(error);
  },
});
const customerInfoFields = ['fullName', 'position', 'companyName', 'email', 'phone'];
const customerInfoFieldLimits = {
  fullName: 200,
  position: 200,
  companyName: 200,
  email: 320,
  phone: 50,
};
const productInfoFields = [
  'productName',
  'category',
  'sizeWeight',
  'productionQuantity',
  'packagingType',
];
const productInfoFieldLimits = {
  productName: 200,
  category: 100,
  sizeWeight: 100,
  productionQuantity: 100,
  packagingType: 100,
};

function hasValidFields(value, fields, limits) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  return fields.every((field) => (
    typeof value[field] === 'string'
    && value[field].length <= limits[field]
  ));
}

function requireTranscriptionAuth(req, res, next) {
  const localOrigin = ['http://localhost:5173', 'http://127.0.0.1:5173']
    .includes(req.get('origin'));
  const localTestAllowed = process.env.NODE_ENV !== 'production'
    && process.env.TRANSCRIPTION_ALLOW_LOCAL_DEV === 'true'
    && req.get('x-local-test-mode') === '1'
    && localOrigin;

  if (localTestAllowed) return next();
  return authenticate(req, res, next);
}

function parseAudioUpload(req, res, next) {
  audioUpload.single('audio')(req, res, (error) => {
    if (!error) return next();
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Tệp âm thanh không được vượt quá 25 MB.' });
    }
    return res.status(error.status || 400).json({
      error: error.status ? error.message : 'Không thể đọc tệp âm thanh đã tải lên.',
    });
  });
}

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    supabaseConfigured: Boolean(getSupabaseConfig()),
  });
});

router.post('/transcriptions', requireTranscriptionAuth, parseAudioUpload, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Vui lòng chọn một tệp âm thanh để nhận diện.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'Backend chưa cấu hình OPENAI_API_KEY để nhận diện tệp âm thanh.',
    });
  }

  const body = new FormData();
  body.append('file', new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);
  body.append('model', process.env.OPENAI_TRANSCRIPTION_MODEL || 'gpt-4o-mini-transcribe');
  body.append('language', 'vi');

  let transcriptionResponse;
  try {
    transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body,
      signal: AbortSignal.timeout(120_000),
    });
  } catch (error) {
    console.error('Audio transcription provider request failed:', error);
    const timedOut = error.name === 'TimeoutError';
    return res.status(timedOut ? 504 : 502).json({
      error: timedOut
        ? 'Dịch vụ nhận diện xử lý quá lâu. Hãy thử tệp ngắn hơn.'
        : 'Không thể kết nối dịch vụ nhận diện âm thanh.',
    });
  }

  let result;
  try {
    result = await transcriptionResponse.json();
  } catch {
    return res.status(502).json({ error: 'Dịch vụ nhận diện trả về phản hồi không hợp lệ.' });
  }

  if (!transcriptionResponse.ok) {
    console.error('Audio transcription provider returned status:', transcriptionResponse.status);
    if (transcriptionResponse.status === 401) {
      return res.status(502).json({ error: 'API key phiên âm không hợp lệ. Hãy kiểm tra cấu hình backend.' });
    }
    if (transcriptionResponse.status === 429) {
      return res.status(503).json({ error: 'Dịch vụ phiên âm đang giới hạn yêu cầu hoặc đã hết hạn mức.' });
    }
    return res.status(502).json({
      error: `Dịch vụ phiên âm từ chối tệp (HTTP ${transcriptionResponse.status}). Hãy kiểm tra định dạng tệp và cấu hình model.`,
    });
  }

  if (!result || typeof result.text !== 'string') {
    return res.status(502).json({ error: 'Dịch vụ nhận diện không trả về nội dung văn bản.' });
  }

  return res.json({ text: result.text });
});

router.get('/me', authenticate, async (req, res) => {
  const { data: profile, error } = await req.supabase
    .from('profiles')
    .select('id, full_name, phone, created_at, updated_at')
    .eq('id', req.user.id)
    .maybeSingle();

  if (error) {
    console.error('Profile query failed:', error);
    return res.status(500).json({ error: 'Unable to load the user profile.' });
  }

  return res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
    },
    profile,
  });
});

router.get('/drafts/current', authenticate, async (req, res) => {
  const { data: draft, error } = await req.supabase
    .from('project_drafts')
    .select('id, customer_info, product_info, current_step, updated_at')
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (error) {
    console.error('Project draft query failed:', error);
    return res.status(500).json({ error: 'Unable to load the project draft.' });
  }

  return res.json({
    draft: draft && {
      id: draft.id,
      customerInfo: draft.customer_info,
      productInfo: draft.product_info,
      currentStep: draft.current_step,
      updatedAt: draft.updated_at,
    },
  });
});

router.put('/drafts/current', authenticate, async (req, res) => {
  const { customerInfo, productInfo, currentStep } = req.body ?? {};
  if (!hasValidFields(customerInfo, customerInfoFields, customerInfoFieldLimits)) {
    return res.status(400).json({ error: 'Customer information is invalid.' });
  }
  if (!hasValidFields(productInfo, productInfoFields, productInfoFieldLimits)) {
    return res.status(400).json({ error: 'Product information is invalid.' });
  }
  if (!Number.isInteger(currentStep) || currentStep < 1 || currentStep > 4) {
    return res.status(400).json({ error: 'The current step is invalid.' });
  }

  const safeCustomerInfo = Object.fromEntries(
    customerInfoFields.map((field) => [field, customerInfo[field]]),
  );
  const safeProductInfo = Object.fromEntries(
    productInfoFields.map((field) => [field, productInfo[field]]),
  );
  const { data: draft, error } = await req.supabase
    .from('project_drafts')
    .upsert({
      user_id: req.user.id,
      customer_info: safeCustomerInfo,
      product_info: safeProductInfo,
      current_step: currentStep,
    }, { onConflict: 'user_id' })
    .select('id, customer_info, product_info, current_step, updated_at')
    .single();

  if (error) {
    console.error('Project draft save failed:', error);
    return res.status(500).json({ error: 'Unable to save the project draft.' });
  }

  return res.json({
    draft: {
      id: draft.id,
      customerInfo: draft.customer_info,
      productInfo: draft.product_info,
      currentStep: draft.current_step,
      updatedAt: draft.updated_at,
    },
  });
});

export default router;
