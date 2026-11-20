import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../auth/useAuth';
import { supabase } from '../auth/supabase';
import { useToast } from '../notifications/useToast';

const suggestedQuestionGroups = [
  {
    title: 'Thương hiệu',
    questions: [
      'Tên thương hiệu của bạn là gì?',
      'Doanh nghiệp của bạn đang kinh doanh sản phẩm hoặc dịch vụ gì?',
      'Bạn muốn thương hiệu của mình truyền tải những giá trị nào?',
      'Bạn muốn khách hàng nhớ đến thương hiệu của mình với đặc điểm gì nổi bật?',
      'Bạn muốn định vị thương hiệu của mình ở phân khúc nào trên thị trường?'
    ]
  },
  {
    title: 'Khách hàng mục tiêu',
    questions: [
      'Khách hàng mục tiêu của bạn là những ai?',
      'Độ tuổi chủ yếu của khách hàng mà bạn muốn hướng đến là bao nhiêu?',
      'Khách hàng của bạn thường quan tâm đến những điều gì khi lựa chọn sản phẩm hoặc dịch vụ?',
      'Bạn muốn khách hàng cảm thấy như thế nào khi nhìn thấy thương hiệu của mình?',
      'Bạn muốn thu hút khách hàng mới, giữ chân khách hàng hiện tại hay cả hai?'
    ]
  },
  {
    title: 'Phong cách',
    questions: [
      'Bạn mong muốn thương hiệu của mình mang phong cách thiết kế như thế nào?',
      'Bạn muốn thiết kế mang lại cảm giác gì cho người nhìn?',
      'Bạn yêu thích phong cách thiết kế tối giản hay nhiều chi tiết và nổi bật?',
      'Bạn muốn hình ảnh thương hiệu thiên về sự hiện đại, trẻ trung, sang trọng hay gần gũi?',
      'Có thương hiệu hoặc phong cách thiết kế nào mà bạn yêu thích và muốn tham khảo không?'
    ]
  },
  {
    title: 'Định hướng thiết kế',
    questions: [
      'Bạn muốn sử dụng những màu sắc chủ đạo nào cho thương hiệu?',
      'Bạn có muốn sử dụng biểu tượng, hình ảnh hoặc họa tiết đặc trưng nào không?',
      'Bạn thích kiểu chữ mang cảm giác hiện đại, thanh lịch, cá tính hay cổ điển?',
      'Bạn muốn thiết kế tập trung vào hình ảnh, chữ viết hay sự kết hợp của cả hai?',
      'Bạn có yêu cầu hoặc giới hạn cụ thể nào mà thiết kế cần tuân theo không?'
    ]
  }
];
const suggestionLauncherWidth = 110;

export default function AiTools() {
  const { user, session, loading } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const localTestMode = import.meta.env.DEV && searchParams.get('localTest') === '1';
  const [analysisLoginPending, setAnalysisLoginPending] = useState(false);
  const draftLoginPendingRef = useRef(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftLoadedForUser, setDraftLoadedForUser] = useState(null);
  const [draftError, setDraftError] = useState('');
  const [currentStep, setCurrentStep] = useState(() => (
    localTestMode && searchParams.get('step') === '3' ? 3 : 1
  ));
  const [formData, setFormData] = useState({
    fullName: '',
    position: '',
    companyName: '',
    email: '',
    phone: ''
  });

  const leftImages = ['/A1.png', '/A2.png', '/A3.png'];
  const rightImages = ['/A4.png', '/A5.png', '/A6.png'];
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(0);

  // Tự động chuyển ảnh minh họa ở hai bên biểu mẫu sau mỗi 5 giây.
  useEffect(() => {
    const leftInterval = setInterval(() => {
      setLeftIndex((prev) => (prev + 1) % leftImages.length);
    }, 5000);
    const rightInterval = setInterval(() => {
      setRightIndex((prev) => (prev + 1) % rightImages.length);
    }, 5000);
    return () => {
      clearInterval(leftInterval);
      clearInterval(rightInterval);
    };
  }, []);

  const [productData, setProductData] = useState({
    productName: '',
    category: '',
    sizeWeight: '',
    productionQuantity: '',
    packagingType: ''
  });

  const [step3Data, setStep3Data] = useState({
    inputType: 'audio',
    audioFile: null,
    textNote: '',
    packagingIndustry: 'Thực phẩm & Đồ uống (F&B)',
    productSegment: 'Luxury / Đẳng cấp cao'
  });
  const [isDragActive, setIsDragActive] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechDetected, setIsSpeechDetected] = useState(false);
  const [audioAnalysisError, setAudioAnalysisError] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingError, setRecordingError] = useState('');
  const audioInputRef = useRef(null);
  const audioPreviewRef = useRef(null);
  const recordingCanvasRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const recordingStartedAtRef = useRef(0);
  const isSpeechDetectedRef = useRef(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [expandedSuggestionGroup, setExpandedSuggestionGroup] = useState(null);
  const [suggestionPosition, setSuggestionPosition] = useState(() => ({
    left: 12,
    top: typeof window === 'undefined' ? 500 : Math.max(12, window.innerHeight - 120)
  }));
  const suggestionDragRef = useRef(null);
  const suggestionMovedRef = useRef(false);
  const suggestionWidgetRef = useRef(null);
  const formTouchedRef = useRef(false);
  const loadingDraft = !localTestMode && Boolean(user && draftLoadedForUser !== user.id);

  const steps = [
    { id: 1, label: 'Thông tin khách hàng' },
    { id: 2, label: 'Sản phẩm chi tiết' },
    { id: 3, label: 'Nội dung yêu cầu' },
    { id: 4, label: 'Đề xuất thiết kế' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    formTouchedRef.current = true;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    formTouchedRef.current = true;
    setProductData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePackagingSelect = (type) => {
    formTouchedRef.current = true;
    setProductData((prev) => {
      const selectedTypes = prev.packagingType
        ? prev.packagingType.split(', ').filter(Boolean)
        : [];
      const nextSelectedTypes = selectedTypes.includes(type)
        ? selectedTypes.filter((selectedType) => selectedType !== type)
        : [...selectedTypes, type];

      return {
        ...prev,
        packagingType: nextSelectedTypes.join(', ')
      };
    });
  };

  const handleStep3InputChange = (e) => {
    const { name, value } = e.target;
    setStep3Data(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputTypeToggle = (type) => {
    setStep3Data(prev => ({
      ...prev,
      inputType: type
    }));
  };

  const selectAudioFile = (file) => {
    if (!file) return;
    const hasAudioType = file.type.startsWith('audio/');
    const hasAudioExtension = /\.(mp3|mp4|mpeg|mpga|m4a|wav|webm|ogg|flac)$/i.test(file.name);
    if (!hasAudioType && !hasAudioExtension) {
      setTranscriptionError('Vui lòng chọn một tệp âm thanh hợp lệ.');
      return;
    }

    setTranscriptionError('');
    setStep3Data(prev => ({
      ...prev,
      audioFile: file,
      textNote: ''
    }));
  };

  const handleFileUpload = (e) => {
    selectAudioFile(e.target.files?.[0]);
  };

  const handleAudioDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    selectAudioFile(e.dataTransfer.files?.[0]);
  };

  const handleTranscribeAudio = async () => {
    if (!step3Data.audioFile || isTranscribing) return;

    setIsTranscribing(true);
    setTranscriptionError('');
    try {
      const body = new FormData();
      body.append('audio', step3Data.audioFile);
      const headers = {};
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }
      if (localTestMode) {
        headers['X-Local-Test-Mode'] = '1';
      }

      const response = await fetch('/api/v1/transcriptions', {
        method: 'POST',
        headers,
        body,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Không thể nhận diện tệp âm thanh.');
      }

      setStep3Data(prev => ({ ...prev, textNote: result.text }));
    } catch (error) {
      console.error('Audio transcription failed:', error);
      setTranscriptionError(error.message || 'Không thể nhận diện tệp âm thanh.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleRecordingToggle = () => {
    if (isRecording) {
      speechRecognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecordingError('Trình duyệt này chưa hỗ trợ nhận diện giọng nói. Hãy thử Chrome hoặc Edge phiên bản mới.');
      return;
    }

    setRecordingError('');
    setAudioAnalysisError('');
    isSpeechDetectedRef.current = false;
    setIsSpeechDetected(false);
    setRecordingSeconds(0);
    recordingStartedAtRef.current = Date.now();
    const recognition = new SpeechRecognition();
    const initialText = step3Data.textNote.trim();
    recognition.lang = 'vi-VN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onspeechstart = () => {
      isSpeechDetectedRef.current = true;
      setIsSpeechDetected(true);
    };
    recognition.onspeechend = () => {
      isSpeechDetectedRef.current = false;
      setIsSpeechDetected(false);
    };
    recognition.onresult = (event) => {
      let recognizedText = '';
      for (let index = 0; index < event.results.length; index += 1) {
        recognizedText += event.results[index][0].transcript;
      }
      setStep3Data(prev => ({
        ...prev,
        textNote: [initialText, recognizedText.trim()].filter(Boolean).join('\n')
      }));
    };
    recognition.onerror = (event) => {
      isSpeechDetectedRef.current = false;
      setIsSpeechDetected(false);
      const messages = {
        'not-allowed': 'Trình duyệt chưa được cấp quyền sử dụng micro.',
        'service-not-allowed': 'Trình duyệt không cho phép sử dụng dịch vụ nhận diện giọng nói.',
        'no-speech': 'Chưa nhận diện được giọng nói. Hãy thử nói gần micro hơn.',
        network: 'Không thể kết nối dịch vụ nhận diện giọng nói của trình duyệt.'
      };
      setRecordingError(messages[event.error] || `Nhận diện giọng nói gặp lỗi (${event.error}).`);
    };
    recognition.onend = () => {
      speechRecognitionRef.current = null;
      setIsRecording(false);
      isSpeechDetectedRef.current = false;
      setIsSpeechDetected(false);
    };
    speechRecognitionRef.current = recognition;
    try {
      recognition.start();
      setIsRecording(true);
    } catch (error) {
      speechRecognitionRef.current = null;
      isSpeechDetectedRef.current = false;
      setIsSpeechDetected(false);
      setRecordingError('Không thể bắt đầu ghi âm. Hãy kiểm tra quyền micro rồi thử lại.');
      console.error('Unable to start speech recognition:', error);
    }
  };

  // Xóa nội dung ghi chú và tệp âm thanh đã chọn ở bước 3.
  const handleRefresh = () => {
    speechRecognitionRef.current?.stop();
    setIsRecording(false);
    isSpeechDetectedRef.current = false;
    setIsSpeechDetected(false);
    setAudioAnalysisError('');
    setRecordingSeconds(0);
    setRecordingError('');
    setTranscriptionError('');
    if (audioInputRef.current) audioInputRef.current.value = '';
    setStep3Data(prev => ({
      ...prev,
      audioFile: null,
      textNote: ''
    }));
  };

  useEffect(() => {
    if (!isRecording) return undefined;
    const interval = setInterval(() => {
      setRecordingSeconds(Math.floor((Date.now() - recordingStartedAtRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (!isRecording) return undefined;

    let cancelled = false;
    let stream;
    let audioContext;
    let animationFrame;

    const startWaveform = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Trình duyệt không hỗ trợ truy cập micro để hiển thị sóng âm.');
        }

        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextConstructor) {
          throw new Error('Trình duyệt không hỗ trợ phân tích tín hiệu micro.');
        }

        audioContext = new AudioContextConstructor();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        audioContext.createMediaStreamSource(stream).connect(analyser);

        const canvas = recordingCanvasRef.current;
        const context = canvas?.getContext('2d');
        if (!canvas || !context) {
          throw new Error('Không thể khởi tạo sóng âm micro.');
        }

        const timeDomainData = new Uint8Array(analyser.fftSize);
        const barCount = 44;
        const silenceThreshold = 0.012;

        const drawWaveform = () => {
          if (cancelled) return;

          const pixelRatio = window.devicePixelRatio || 1;
          const width = canvas.clientWidth;
          const height = canvas.clientHeight;
          if (!width || !height) {
            animationFrame = requestAnimationFrame(drawWaveform);
            return;
          }
          if (canvas.width !== Math.round(width * pixelRatio)
            || canvas.height !== Math.round(height * pixelRatio)) {
            canvas.width = Math.round(width * pixelRatio);
            canvas.height = Math.round(height * pixelRatio);
          }

          context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
          context.clearRect(0, 0, width, height);
          analyser.getByteTimeDomainData(timeDomainData);

          let totalAmplitude = 0;
          for (let index = 0; index < timeDomainData.length; index += 1) {
            const amplitude = (timeDomainData[index] - 128) / 128;
            totalAmplitude += amplitude * amplitude;
          }

          const rms = Math.sqrt(totalAmplitude / timeDomainData.length);
          const speechActive = isSpeechDetectedRef.current && rms >= silenceThreshold;
          const centerY = height / 2;
          const barWidth = 2;
          const gap = Math.max(2, (width - barCount * barWidth) / (barCount - 1));
          const sampleCountPerBar = Math.floor(timeDomainData.length / barCount);
          context.beginPath();
          context.moveTo(0, centerY);
          context.lineTo(width, centerY);
          context.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          context.lineWidth = 1;
          context.stroke();

          if (speechActive) {
            context.strokeStyle = '#fff';
            context.lineWidth = barWidth;
            for (let bar = 0; bar < barCount; bar += 1) {
              const start = bar * sampleCountPerBar;
              let peak = 0;
              for (let sample = start; sample < start + sampleCountPerBar; sample += 1) {
                peak = Math.max(peak, Math.abs((timeDomainData[sample] - 128) / 128));
              }

              const normalizedPeak = Math.min(1, Math.max(0, (peak - silenceThreshold) / 0.22));
              const amplitude = Math.max(2, normalizedPeak * (height / 2 - 3));
              const x = bar * (barWidth + gap) + barWidth / 2;
              context.beginPath();
              context.moveTo(x, centerY - amplitude);
              context.lineTo(x, centerY + amplitude);
              context.stroke();
            }
          }

          animationFrame = requestAnimationFrame(drawWaveform);
        };

        drawWaveform();
      } catch (error) {
        if (cancelled) return;
        stream?.getTracks().forEach((track) => track.stop());
        if (audioContext && audioContext.state !== 'closed') {
          audioContext.close().catch((closeError) => {
            console.error('Unable to close audio analysis context:', closeError);
          });
        }
        console.error('Unable to analyze microphone frequencies:', error);
        setAudioAnalysisError(error.message || 'Không thể hiển thị sóng âm micro.');
      }
    };

    startWaveform();
    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
      stream?.getTracks().forEach((track) => track.stop());
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch((error) => {
          console.error('Unable to close audio analysis context:', error);
        });
      }
    };
  }, [isRecording]);

  useEffect(() => () => {
    speechRecognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    const audioPreview = audioPreviewRef.current;
    if (!step3Data.audioFile || !audioPreview) return undefined;
    const previewUrl = URL.createObjectURL(step3Data.audioFile);
    audioPreview.src = previewUrl;
    return () => {
      URL.revokeObjectURL(previewUrl);
      audioPreview.removeAttribute('src');
      audioPreview.load();
    };
  }, [step3Data.audioFile]);

  // Lưu vị trí bắt đầu để kéo hộp câu hỏi gợi ý đến vị trí khác trên màn hình.
  const handleSuggestionPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    suggestionDragRef.current = {
      pointerId: e.pointerId,
      pointerX: e.clientX,
      pointerY: e.clientY,
      left: suggestionPosition.left,
      top: suggestionPosition.top
    };
    suggestionMovedRef.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  // Cập nhật vị trí hộp gợi ý và giới hạn trong phạm vi màn hình.
  const handleSuggestionPointerMove = (e) => {
    const drag = suggestionDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    const deltaX = e.clientX - drag.pointerX;
    const deltaY = e.clientY - drag.pointerY;
    if (Math.hypot(deltaX, deltaY) > 5) {
      suggestionMovedRef.current = true;
    }

    if (suggestionMovedRef.current) {
      const bounds = e.currentTarget.getBoundingClientRect();
      setSuggestionPosition({
        left: Math.min(Math.max(0, drag.left + deltaX), window.innerWidth - bounds.width),
        top: Math.min(Math.max(0, drag.top + deltaY), window.innerHeight - bounds.height)
      });
    }
  };

  const handleSuggestionPointerEnd = (e) => {
    if (suggestionDragRef.current?.pointerId === e.pointerId) {
      suggestionDragRef.current = null;
    }
  };

  const handleSuggestionLauncherClick = () => {
    if (suggestionMovedRef.current) {
      suggestionMovedRef.current = false;
      return;
    }
    setExpandedSuggestionGroup(null);
    setSuggestionsOpen((open) => !open);
  };

  // Chuyển câu hỏi được chọn vào ghi chú và đổi sang chế độ nhập văn bản.
  const handleSuggestedQuestionSelect = (question) => {
    setStep3Data((prev) => ({
      ...prev,
      inputType: 'text',
      textNote: prev.textNote ? `${prev.textNote}\n${question}` : question
    }));
    setSuggestionsOpen(false);
  };

  // Đóng hộp gợi ý khi nhấn phím thoát hoặc nhấn ra ngoài hộp.
  useEffect(() => {
    if (!suggestionsOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSuggestionsOpen(false);
    };
    const handleOutsidePointerDown = (e) => {
      if (!suggestionWidgetRef.current?.contains(e.target)) {
        setSuggestionsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handleOutsidePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handleOutsidePointerDown);
    };
  }, [suggestionsOpen]);

  const saveCustomerDraft = async (accessToken, customerInfo, productInfo, currentStep) => {
    const response = await fetch('/api/v1/drafts/current', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerInfo, productInfo, currentStep }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Không thể lưu bản nháp. Vui lòng thử lại.');
    }
    return result.draft;
  };

  // Điều hướng giữa các bước, đồng thời lưu thông tin khách hàng trước khi sang bước 2.
  const handleContinue = async () => {
    if (currentStep === 1) {
      if (loading || savingDraft) return;
      setDraftError('');

      if (localTestMode) {
        setCurrentStep(2);
        return;
      }

      if (!user) {
        draftLoginPendingRef.current = currentStep;
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('auth', 'login');
        setSearchParams(nextParams);
        return;
      }

      setSavingDraft(true);
      try {
        if (!session?.access_token) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        await saveCustomerDraft(session.access_token, formData, productData, 2);
        setCurrentStep(2);
        showSuccess('Đã lưu bản nháp thông tin khách hàng.');
      } catch (error) {
        console.error('Unable to save customer draft:', error);
        setDraftError(error.message || 'Không thể lưu bản nháp. Vui lòng thử lại.');
      } finally {
        setSavingDraft(false);
      }
      return;
    }

    if (currentStep === 2) {
      if (loading || savingDraft) return;
      setDraftError('');

      if (localTestMode) {
        setCurrentStep(3);
        return;
      }

      if (!user) {
        draftLoginPendingRef.current = currentStep;
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('auth', 'login');
        setSearchParams(nextParams);
        return;
      }

      setSavingDraft(true);
      try {
        if (!session?.access_token) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        await saveCustomerDraft(session.access_token, formData, productData, 3);
        setCurrentStep(3);
        showSuccess('Đã lưu bản nháp thông tin sản phẩm.');
      } catch (error) {
        console.error('Unable to save product draft:', error);
        setDraftError(error.message || 'Không thể lưu bản nháp. Vui lòng thử lại.');
      } finally {
        setSavingDraft(false);
      }
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Quay lại bước trước đó nếu không ở bước đầu tiên.
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleAnalysis = () => {
    if (loading) return;
    if (user) {
      navigate('/coming-soon');
      return;
    }

    setAnalysisLoginPending(true);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('auth', 'login');
    setSearchParams(nextParams);
  };

  const handleAnalysisLoginSuccess = () => {
    if (!analysisLoginPending) return;

    setAnalysisLoginPending(false);
    navigate('/coming-soon');
  };

  const handleLoginSuccess = async () => {
    if (draftLoginPendingRef.current !== null) {
      const savedStep = draftLoginPendingRef.current;
      draftLoginPendingRef.current = null;
      setSavingDraft(true);
      setDraftError('');
      try {
        if (!supabase) {
          throw new Error('Chưa cấu hình Supabase. Vui lòng thử lại sau.');
        }
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!data.session?.access_token) {
          throw new Error('Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập lại.');
        }
        await saveCustomerDraft(data.session.access_token, formData, productData, savedStep + 1);
        setCurrentStep(savedStep + 1);
        showSuccess(savedStep === 1
          ? 'Đã lưu bản nháp thông tin khách hàng.'
          : 'Đã lưu bản nháp thông tin sản phẩm.');
      } catch (error) {
        console.error('Unable to save customer draft after login:', error);
        setDraftError(error.message || 'Không thể lưu bản nháp. Vui lòng thử lại.');
      } finally {
        setSavingDraft(false);
      }
      return;
    }
    handleAnalysisLoginSuccess();
  };

  const handleAuthModalClose = () => {
    draftLoginPendingRef.current = null;
    setAnalysisLoginPending(false);
  };

  useEffect(() => {
    if (localTestMode || !user || !session?.access_token || savingDraft) return undefined;

    let isMounted = true;
    fetch('/api/v1/drafts/current', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    }).then(async (response) => {
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Không thể tải bản nháp.');
      }
      if (!isMounted || !result.draft || formTouchedRef.current) return;

      const restoredInfo = result.draft.customerInfo;
      const restoredProductInfo = result.draft.productInfo ?? {};
      const customerInfo = {
        fullName: restoredInfo.fullName ?? '',
        position: restoredInfo.position ?? '',
        companyName: restoredInfo.companyName ?? '',
        email: restoredInfo.email ?? '',
        phone: restoredInfo.phone ?? '',
      };
      const productInfo = {
        productName: restoredProductInfo.productName ?? '',
        category: restoredProductInfo.category ?? '',
        sizeWeight: restoredProductInfo.sizeWeight ?? '',
        productionQuantity: restoredProductInfo.productionQuantity ?? '',
        packagingType: restoredProductInfo.packagingType ?? '',
      };
      setFormData(customerInfo);
      setProductData(productInfo);
      setCurrentStep(result.draft.currentStep);
    }).catch((error) => {
      if (!isMounted) return;
      console.error('Unable to load project draft:', error);
      setDraftError(error.message || 'Không thể tải bản nháp.');
    }).finally(() => {
      if (isMounted) setDraftLoadedForUser(user.id);
    });

    return () => {
      isMounted = false;
    };
  }, [user, session?.access_token, savingDraft, localTestMode]);

  const renderFormContent = () => {
    if (currentStep === 1) {
      return (
        <>
          <h1 className="form-title">Thông tin khách hàng</h1>
          <p className="form-description">
            Cho chúng tôi biết bạn là ai để bắt đầu hành trình thiết kế.
          </p>

          <form className="customer-form">
            <div className="form-group">
              <label htmlFor="fullName">HỌ VÀ TÊN (FULL NAME)</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Nhập họ và tên"
              />
            </div>

            <div className="form-group">
              <label htmlFor="position">CHỨC VỤ (POSITION)</label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                placeholder="Nhập chức vụ"
              />
            </div>

            <div className="form-group">
              <label htmlFor="companyName">TÊN CÔNG TY / THƯƠNG HIỆU (COMPANY / BRAND NAME)</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Nhập tên công ty hoặc thương hiệu"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">GMAIL</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Nhập email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">SỐ ĐIỆN THOẠI (PHONE NUMBER)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Nhập số điện thoại"
              />
            </div>
          </form>
        </>
      );
    } else if (currentStep === 2) {
      return (
        <>
          <h1 className="form-title">Sản phẩm chi tiết</h1>
          <p className="form-description">
            Cung cấp thông tin chi tiết về sản phẩm của bạn.
          </p>

          <form className="product-form">
            <div className="form-group">
              <label htmlFor="productName">TÊN SẢN PHẨM (PRODUCT NAME)</label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={productData.productName}
                onChange={handleProductInputChange}
                placeholder="Nhập tên sản phẩm"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">DANH MỤC (CATEGORY)</label>
              <input
                type="text"
                id="category"
                name="category"
                value={productData.category}
                onChange={handleProductInputChange}
                placeholder="Nhập danh mục sản phẩm"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sizeWeight">KÍCH THƯỚC / TRỌNG LƯỢNG (SIZE / WEIGHT)</label>
              <input
                type="text"
                id="sizeWeight"
                name="sizeWeight"
                value={productData.sizeWeight}
                onChange={handleProductInputChange}
                placeholder="Nhập kích thước hoặc trọng lượng"
              />
            </div>

            <div className="form-group">
              <label htmlFor="productionQuantity">SỐ LƯỢNG DỰ KIẾN SẢN XUẤT (ESTIMATED PRODUCTION QUANTITY)</label>
              <input
                type="text"
                id="productionQuantity"
                name="productionQuantity"
                value={productData.productionQuantity}
                onChange={handleProductInputChange}
                placeholder="Nhập số lượng dự kiến"
              />
            </div>

            <div className="form-group">
              <label>LOẠI BAO BÌ (PACKAGING TYPE)</label>
              <div className="packaging-options" role="group" aria-label="Chọn một hoặc nhiều loại bao bì">
                {['Hộp giấy', 'Túi giấy', 'Lon / hủ', 'Chai lọ', 'Túi đựng', 'Bao bì linh hoạt', 'Selve / nhãn'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`packaging-option ${productData.packagingType.split(', ').includes(type) ? 'selected' : ''}`}
                    aria-pressed={productData.packagingType.split(', ').includes(type)}
                    onClick={() => handlePackagingSelect(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="packagingIndustry">NGÀNH HÀNG PACKAGING</label>
              <select
                id="packagingIndustry"
                name="packagingIndustry"
                value={step3Data.packagingIndustry}
                onChange={handleStep3InputChange}
                className="dropdown-select"
              >
                <option>Thực phẩm & Đồ uống (F&B)</option>
                <option>Thời trang & Phụ kiện</option>
                <option>Chăm sóc cá nhân & Làm đẹp</option>
                <option>Dược phẩm & Y tế</option>
                <option>Điện tử & Công nghệ</option>
                <option>Khác</option>
              </select>
            </div>
          </form>
        </>
      );
    } else if (currentStep === 3) {
      return (
        <>
          <div className="step3-header">
            <h1 className="form-title">Nội dung yêu cầu</h1>
            <button className="refresh-btn" onClick={handleRefresh}>
              ↻ Làm mới
            </button>
          </div>

          {/* Chọn nhập yêu cầu bằng tệp ghi âm hoặc ghi chú văn bản */}
          <div className="input-type-toggle">
            <button
              className={`toggle-btn ${step3Data.inputType === 'audio' ? 'active' : ''}`}
              onClick={() => handleInputTypeToggle('audio')}
            >
              File Ghi Âm
            </button>
            <button
              className={`toggle-btn ${step3Data.inputType === 'text' ? 'active' : ''}`}
              onClick={() => handleInputTypeToggle('text')}
            >
              Ghi chú văn bản
            </button>
          </div>

          {step3Data.inputType === 'audio' ? (
            <>
              {/* Khu vực tải tệp ghi âm lên */}
              <div
                className={`upload-area ${isDragActive ? 'is-drag-active' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragActive(true);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setIsDragActive(false);
                }}
                onDrop={handleAudioDrop}
              >
                <input
                  ref={audioInputRef}
                  type="file"
                  id="audioFile"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="audioFile" className="upload-label">
                  <div className="upload-icon">📁</div>
                  <span>Kéo thả tệp ghi âm hoặc click để chọn</span>
                </label>
                {step3Data.audioFile && (
                  <div className="uploaded-file">
                    <span>📄 {step3Data.audioFile.name}</span>
                    <audio ref={audioPreviewRef} className="audio-preview" controls>
                      Trình duyệt không hỗ trợ phát tệp âm thanh.
                    </audio>
                  </div>
                )}
              </div>
              {step3Data.audioFile && (
                <button
                  className="transcribe-btn"
                  type="button"
                  onClick={handleTranscribeAudio}
                  disabled={isTranscribing}
                >
                  {isTranscribing ? 'Đang nhận diện...' : 'Chuyển giọng nói thành văn bản'}
                </button>
              )}
              {transcriptionError && <p className="audio-feature-error" role="alert">{transcriptionError}</p>}

              {/* Nút bắt đầu thu âm trực tiếp */}
              <button
                className={`recording-btn ${isRecording ? 'is-recording' : ''}`}
                type="button"
                onClick={handleRecordingToggle}
                aria-label={isRecording ? 'Dừng nhận diện trực tiếp' : 'Bắt đầu nhận diện trực tiếp'}
              >
                {isRecording ? (
                  <>
                    <span className="recording-stop-mark" aria-hidden="true" />
                    <canvas
                      ref={recordingCanvasRef}
                      className="recording-waveform-canvas"
                      role="img"
                      aria-label="Sóng âm micro trực tiếp"
                    />
                  </>
                ) : (
                  <>
                    <span className="mic-icon" aria-hidden="true">🎤</span>
                    <span>Bắt đầu nhận diện trực tiếp</span>
                  </>
                )}
                <span className="timer">
                  {String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:{String(recordingSeconds % 60).padStart(2, '0')}
                </span>
              </button>
              {isRecording && (
                <div className="recording-status" role="status" aria-live="polite">
                  <span className="recording-status-text">
                    {isSpeechDetected
                      ? 'Đã nhận giọng nói — đang chuyển thành văn bản bên dưới.'
                      : 'Đang lắng nghe — hãy nói vào micro để bắt đầu nhận diện.'}
                  </span>
                </div>
              )}
              {audioAnalysisError && <p className="audio-feature-error" role="alert">{audioAnalysisError}</p>}
              {recordingError && <p className="audio-feature-error" role="alert">{recordingError}</p>}
              <div className="form-group transcript-group">
                <label htmlFor="audioTranscript">NỘI DUNG NHẬN DIỆN (CÓ THỂ CHỈNH SỬA)</label>
                <textarea
                  id="audioTranscript"
                  name="textNote"
                  value={step3Data.textNote}
                  onChange={handleStep3InputChange}
                  placeholder="Văn bản nhận diện từ tệp hoặc micro sẽ hiển thị ở đây..."
                  rows={6}
                  className="text-area"
                  aria-live="polite"
                />
                <small className="transcript-help">
                  Hãy nghe lại bản ghi và đối chiếu nội dung nhận diện; bạn có thể chỉnh sửa văn bản ngay tại đây.
                </small>
              </div>
            </>
          ) : (
            <div className="form-group">
              <label htmlFor="textNote">GHI CHÚ VĂN BẢN</label>
              <textarea
                id="textNote"
                name="textNote"
                value={step3Data.textNote}
                onChange={handleStep3InputChange}
                placeholder="Nhập ghi chú của bạn..."
                rows={6}
                className="text-area"
              />
            </div>
          )}



        </>
      );
    }
    return null;
  };

  const suggestionAvailableLeft = suggestionPosition.left - 24;
  const suggestionAvailableRight = window.innerWidth - suggestionPosition.left - suggestionLauncherWidth - 24;
  const suggestionAlignRight = suggestionAvailableLeft > suggestionAvailableRight;
  const suggestionDialogWidth = Math.max(
    0,
    Math.min(430, suggestionAlignRight ? suggestionAvailableLeft : suggestionAvailableRight)
  );
  const continueButton = (
    <button className="continue-btn" onClick={handleContinue} disabled={savingDraft || loadingDraft || loading}>
      {savingDraft ? 'Đang lưu...' : loadingDraft ? 'Đang tải...' : 'Tiếp tục'} {!savingDraft && !loadingDraft && <span aria-hidden="true">→</span>}
    </button>
  );

  return (
    <main className="ai-tools-page">
      <Header
        onLoginSuccess={handleLoginSuccess}
        onAuthModalClose={handleAuthModalClose}
      />

      <section className="ai-tools-content">
        <div className="ai-tools-container">
          {localTestMode && (
            <p className="local-test-notice" role="status">
              Chế độ thử local: không cần đăng nhập; thông tin khách hàng và sản phẩm sẽ không được lưu.
            </p>
          )}

          {/* Thanh hiển thị tiến độ các bước */}
          <div className="step-indicator">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`step-item ${step.id === currentStep ? 'active' : ''} ${step.id < currentStep ? 'completed' : ''}`}
              >
                <div className="step-number">{step.id}</div>
                <span className="step-label">{step.label}</span>
              </div>
            ))}
          </div>

          {draftError && <p className="draft-save-error" role="alert">{draftError}</p>}

          {/* Nội dung biểu mẫu của bước hiện tại */}
          {currentStep <= 3 ? (
            <div className="form-layout-with-images">
              {/* Ảnh minh họa bên trái biểu mẫu */}
              <div className="ai-image-carousel left-carousel">
                <img src={leftImages[leftIndex]} alt="Gallery" className="carousel-image" />
              </div>

              {/* Thẻ biểu mẫu chính */}
              <div className="form-card">
                {currentStep > 1 && (
                  <div className="form-card-back">
                    <button className="back-btn" onClick={handleBack}>
                      ← Quay lại
                    </button>
                  </div>
                )}
                {renderFormContent()}
                <div className="form-card-actions">{continueButton}</div>
              </div>

              {/* Ảnh minh họa bên phải biểu mẫu */}
              <div className="ai-image-carousel right-carousel">
                <img src={rightImages[rightIndex]} alt="Gallery" className="carousel-image" />
              </div>
            </div>
          ) : (
            <div className="form-card">
              {currentStep > 1 && (
                <div className="form-card-back">
                  <button className="back-btn" onClick={handleBack}>
                    ← Quay lại
                  </button>
                </div>
              )}
              {renderFormContent()}
              <div className="form-card-actions">{continueButton}</div>
            </div>
          )}
          {currentStep === 3 && (
            <>
              <button
                className="ai-analysis-btn"
                type="button"
                onClick={handleAnalysis}
                disabled={loading}
              >
                <span>Chạy AI Phân Tích &amp; Tạo Brief</span>
              </button>

              <section className="ai-analysis-result" aria-labelledby="ai-analysis-title">
                <div className="ai-analysis-result-header">
                  <h2 id="ai-analysis-title">AI phân tích</h2>
                  <button className="analysis-refresh-btn" type="button">
                    Làm mới <span aria-hidden="true">↻</span>
                  </button>
                </div>

                <div className="analysis-section">
                  <h3 className="analysis-section-title">
                    A. Khó khăn (pain points) &amp; nhu cầu trích xuất
                  </h3>
                  <div className="analysis-summary-grid">
                    <div className="analysis-output-card">
                      <h4 className="analysis-output-title pain-points-title">
                        <span aria-hidden="true">●</span> Vấn đề hiện tại của khách
                      </h4>
                      <p>Thông tin sẽ hiển thị sau khi AI phân tích.</p>
                    </div>
                    <div className="analysis-output-card">
                      <h4 className="analysis-output-title customer-needs-title">
                        <span aria-hidden="true">●</span> Nhu cầu khách hàng
                      </h4>
                      <p>Thông tin sẽ hiển thị sau khi AI phân tích.</p>
                    </div>
                  </div>
                  <div className="analysis-output-card">
                    <h4 className="analysis-output-title">CÁC TÌNH HUỐNG GIẢ ĐỊNH</h4>
                    <p>Những giả định cần xác nhận sẽ hiển thị tại đây.</p>
                  </div>
                </div>

                <div className="analysis-section">
                  <h3 className="analysis-section-title">
                    B. Định hướng thiết kế (AI design brief)
                  </h3>
                  <div className="analysis-output-card">
                    <h4 className="analysis-output-title">PHONG CÁCH KHUYẾN DÙNG</h4>
                    <p>Phong cách thiết kế đề xuất sẽ hiển thị tại đây.</p>
                  </div>
                  <div className="analysis-output-card analysis-timeline-card">
                    <h4 className="analysis-output-title">TIMELINE DỰ ÁN</h4>
                    <p>Tiến độ dự kiến sẽ hiển thị tại đây.</p>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </section>

      {currentStep === 3 && (
        <div
          ref={suggestionWidgetRef}
          className={`suggestion-widget ${suggestionsOpen ? 'is-open' : ''}`}
          style={{ left: suggestionPosition.left, top: suggestionPosition.top }}
        >
          <button
            type="button"
            className="suggestion-launcher"
            onPointerDown={handleSuggestionPointerDown}
            onPointerMove={handleSuggestionPointerMove}
            onPointerUp={handleSuggestionPointerEnd}
            onPointerCancel={handleSuggestionPointerEnd}
            onClick={handleSuggestionLauncherClick}
            aria-expanded={suggestionsOpen}
            aria-haspopup="dialog"
          >
            <span className="suggestion-launcher-label">Câu hỏi gợi ý</span>
            <span className="suggestion-launcher-mascot">
              <img src="/Chatbox.png" alt="" />
            </span>
          </button>

          {suggestionsOpen && (
            <section
              className={`suggestion-dialog ${suggestionAlignRight ? 'align-right' : ''} ${suggestionPosition.top > window.innerHeight / 2 ? '' : 'open-below'}`}
              style={{ width: suggestionDialogWidth }}
              role="dialog"
              aria-labelledby="suggestion-dialog-title"
            >
              <h2 id="suggestion-dialog-title">Câu hỏi gợi ý</h2>
              <div className="suggestion-groups">
                {suggestedQuestionGroups.map((group, index) => {
                  const isExpanded = expandedSuggestionGroup === index;
                  const questionsId = `suggestion-questions-${index}`;
                  return (
                    <div className="suggestion-group" key={group.title}>
                      <button
                        type="button"
                        className="suggestion-group-toggle"
                        aria-expanded={isExpanded}
                        aria-controls={questionsId}
                        onClick={() => setExpandedSuggestionGroup(isExpanded ? null : index)}
                      >
                        <span className="suggestion-group-copy">
                          <strong>{group.title}</strong>
                          <small>{[
                            'Hiểu rõ giá trị và định vị thương hiệu',
                            'Xác định đúng đối tượng và hành vi người dùng',
                            'Làm rõ cảm giác và ngôn ngữ thiết kế mong muốn',
                            'Chốt các yếu tố cụ thể cho thiết kế'
                          ][index]}</small>
                        </span>
                        <span className="suggestion-group-count">5 câu hỏi</span>
                        <span className={`suggestion-chevron ${isExpanded ? 'expanded' : ''}`} aria-hidden="true">⌄</span>
                      </button>
                      {isExpanded && (
                        <ul className="suggestion-question-list" id={questionsId}>
                          {group.questions.map((question) => (
                            <li key={question}>
                              <button
                                type="button"
                                onClick={() => handleSuggestedQuestionSelect(question)}
                              >
                                {question}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}

      <Footer />
    </main>
  );
}
