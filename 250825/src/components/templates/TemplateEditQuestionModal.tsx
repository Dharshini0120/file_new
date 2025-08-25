import React, { useState, useEffect, useRef } from 'react';
import {
    TextField,
    Checkbox,
    FormControlLabel,
    Button,
    Box,
    Typography,
    IconButton
} from '@mui/material';
import { Trash2 } from 'lucide-react';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

interface OptionData {
    text: string;
    score?: number | string;
    referralText?: string; // Custom referral text instead of predefined types
}

interface EditQuestionModalProps {
    questionData: {
        question: string;
        questionType: string;
        options: string[] | OptionData[];
        isRequired: boolean;
        optionsData?: OptionData[]; // Add optionsData to the interface
    };
    onSave: (data: any) => void;
    onCancel: () => void;
    isNewQuestion?: boolean;
    nodePosition?: { x: number; y: number };
}

const TemplateEditQuestionModal: React.FC<EditQuestionModalProps> = ({
    questionData,
    onSave,
    onCancel,
    isNewQuestion = false,
    nodePosition
}) => {
    console.log('🚀 TemplateEditQuestionModal received questionData:', questionData);

    const [question, setQuestion] = useState(questionData.question || '');
    const [questionType, setQuestionType] = useState(questionData.questionType || 'text-input');

    // Convert legacy string options to new OptionData format - moved outside useCallback for initial state
    const convertToOptionData = (opts: string[] | OptionData[], optionsDataArray?: OptionData[]): OptionData[] => {
        console.log('🔄 TemplateEditQuestionModal - Converting options to OptionData format:', opts);
        console.log('🔄 OptionsData array:', optionsDataArray);
        console.log('🔄 Options type check:', typeof opts, Array.isArray(opts));

        if (!opts || opts.length === 0) {
            console.log('📝 No options provided, using defaults');
            return [
                { text: 'Enter option text here', score: undefined, referralText: '' },
                { text: 'Enter option text here', score: undefined, referralText: '' }
            ];
        }

        const converted = opts.map((opt: string | OptionData, index: number) => {
            console.log(`🔄 Processing option ${index}:`, opt, typeof opt);
            if (typeof opt === 'object' && opt !== null) {
                console.log(`🔄 Option ${index} keys:`, Object.keys(opt));
                console.log(`🔄 Option ${index} text property:`, opt.text);
                console.log(`🔄 Option ${index} score property:`, opt.score);
            }

            if (typeof opt === 'string') {
                console.log('📝 Converting string option:', opt);

                // Check if there's corresponding optionsData for this index
                const optionData = optionsDataArray && optionsDataArray[index];
                console.log(`📝 OptionsData for index ${index}:`, optionData);

                // Check if the string contains score information like "Onsite (Score: 0.6)"
                const scoreMatch = opt.match(/^(.+?)\s*\(Score:\s*([\d.]+)\)$/);
                if (scoreMatch) {
                    const result = {
                        text: scoreMatch[1].trim(),
                        score: parseFloat(scoreMatch[2]),
                        referralText: optionData?.referralText || ''
                    };
                    console.log('📝 Parsed option with embedded score:', result);
                    return result;
                } else {
                    // Merge string option with optionsData if available
                    const result = {
                        text: opt,
                        score: optionData?.score || undefined,
                        referralText: optionData?.referralText || ''
                    };
                    console.log('📝 Merged option with optionsData:', result);
                    return result;
                }
            } else if (typeof opt === 'object' && opt !== null) {
                // Handle object options - check if they have the required 'text' property
                if ('text' in opt && opt.text !== undefined && opt.text !== '') {
                    console.log('📝 Using existing OptionData with text:', opt);
                    return opt as OptionData;
                } else {
                    // Object exists but missing 'text' property - this is the issue case
                    console.log('📝 Object missing text property, creating default text:', opt);
                    return {
                        text: `Enter option text here`,
                        score: opt.score || undefined,
                        referralText: opt.referralText || ''
                    };
                }
            }
            
            console.log('📝 Fallback case, creating default option:', opt);
            return {
                text: `Enter option text here`,
                score: undefined,
                referralText: ''
            };
        });

        console.log('✅ Final converted options:', converted);
        return converted;
    };

    // Initialize options state with proper conversion
    const getInitialOptions = (): OptionData[] => {
        console.log('🎯 TemplateEditQuestionModal - Getting initial options from questionData:', questionData.options);
        console.log('🎯 questionData full object:', questionData);
        console.log('🎯 questionData.optionsData:', questionData.optionsData);
        console.log('🎯 questionData.options type:', typeof questionData.options, Array.isArray(questionData.options));
        if (questionData.options && Array.isArray(questionData.options)) {
            console.log('🎯 questionData.options[0]:', questionData.options[0]);
            console.log('🎯 questionData.options[0] type:', typeof questionData.options[0]);
            if (questionData.options[0] && typeof questionData.options[0] === 'object') {
                console.log('🎯 questionData.options[0] keys:', Object.keys(questionData.options[0]));
            }
        }

        // If questionData.options is already OptionData[], use it directly
        if (questionData.options && Array.isArray(questionData.options) && questionData.options.length > 0) {
            const firstOption = questionData.options[0];
            if (typeof firstOption === 'object' && 'text' in firstOption && firstOption.text !== undefined && firstOption.text !== '') {
                console.log('🎯 Options are already OptionData format:', questionData.options);
                return questionData.options as OptionData[];
            }
        }

        if (!questionData.options || questionData.options.length === 0) {
            console.log('⚠️ No questionData.options found, using defaults');
            return [
                { text: 'Option 1', score: undefined, referralText: '' },
                { text: 'Option 2', score: undefined, referralText: '' }
            ];
        }

        try {
            // Pass both options and optionsData to the converter
            const optionsDataArray = questionData.optionsData;
            const initialOptions = convertToOptionData(questionData.options, optionsDataArray);
            console.log('🎯 Initial converted options:', initialOptions);

            // Ensure we have at least some options
            if (!initialOptions || initialOptions.length === 0) {
                console.log('⚠️ No options found after conversion, using defaults');
                return [
                    { text: 'Enter option text here', score: undefined, referralText: '' },
                    { text: 'Enter option text here', score: undefined, referralText: '' }
                ];
            }

            return initialOptions;
        } catch (error) {
            console.error('❌ Error converting options:', error);
            return [
                { text: 'Enter option text here', score: undefined, referralText: '' },
                { text: 'Enter option text here', score: undefined, referralText: '' }
            ];
        }
    };

    const [options, setOptions] = useState<OptionData[]>(getInitialOptions());
    const [isRequired, setIsRequired] = useState(questionData.isRequired || false);

    // Debug: Log initial options state
    console.log('🎯 Modal initial options state:', options);

    // Update state when questionData changes (important for edit mode)
    useEffect(() => {
        console.log('📝 TemplateEditQuestionModal - questionData changed:', questionData);
        console.log('📝 Current options state:', options);
        console.log('📝 New options from questionData:', questionData.options);

        setQuestion(questionData.question || '');
        setQuestionType(questionData.questionType || 'text-input');

        // Use the same logic as getInitialOptions for consistency
        let newOptions: OptionData[];

        // If questionData.options is already OptionData[], use it directly
        if (questionData.options && Array.isArray(questionData.options) && questionData.options.length > 0) {
            const firstOption = questionData.options[0];
            if (typeof firstOption === 'object' && 'text' in firstOption && firstOption.text !== undefined && firstOption.text !== '') {
                console.log('📝 Options are already OptionData format:', questionData.options);
                newOptions = questionData.options as OptionData[];
            } else {
                // Convert string options with optionsData
                const optionsDataArray = questionData.optionsData;
                newOptions = convertToOptionData(questionData.options, optionsDataArray);
            }
        } else {
            // No options or empty array
            newOptions = [];
        }

        console.log('📝 Converted new options:', newOptions);
        setOptions(newOptions);

        setIsRequired(questionData.isRequired || false);
    }, [questionData]);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const modalRef = useRef<HTMLDivElement>(null);
    // Position modal in canvas coordinates
    const getInitialPosition = () => {
        if (nodePosition) {
            return {
                x: nodePosition.x,
                y: nodePosition.y
            };
        }
        return {
            x: 300,
            y: 200
        };
    };

    const [position, setPosition] = useState(getInitialPosition());

    // Update position when nodePosition changes
    useEffect(() => {
        if (nodePosition) {
            // Use the exact position provided, with minimal constraint checking
            const constrainedPosition = {
                x: Math.max(10, Math.min(nodePosition.x, window.innerWidth - 420)), // Keep within bounds
                y: Math.max(10, Math.min(nodePosition.y, window.innerHeight - 600))
            };
            setPosition(constrainedPosition);
        }
    }, [nodePosition]);

    // Constrain position to canvas bounds
    const constrainPosition = (newPosition: { x: number; y: number }) => {
        const modalWidth = 400;
        const modalHeight = modalRef.current?.offsetHeight || 600;

        return {
            x: Math.max(10, Math.min(newPosition.x, window.innerWidth - modalWidth - 10)),
            y: Math.max(10, Math.min(newPosition.y, window.innerHeight - modalHeight - 10))
        };
    };

    const questionTypes = [
        { value: 'text-input', label: 'Text Input' },
        { value: 'radio', label: 'Radio' },
        { value: 'checkbox', label: 'Checkbox' }
    ];

    // Update options when question type changes
    useEffect(() => {
        if (questionType === 'text-input') {
            setOptions([]);
        } else if (options.length === 0) {
            setOptions([
                { text: 'Enter option text here', score: undefined, referralText: '' },
                { text: 'Enter option text here', score: undefined, referralText: '' }
            ]);
        }
    }, [questionType, options.length]);

    const handleHeaderMouseDown = (e: React.MouseEvent) => {
        // Only start dragging from header
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
        e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            const newPosition = {
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            };
            setPosition(constrainPosition(newPosition));
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart]);

    const handleSave = () => {
        if (!question.trim()) {
            alert('Please enter a question');
            return;
        }

        // Validate that all options have text values
        const invalidOptions = options.filter(opt => !opt.text || opt.text.trim() === '');
        if (invalidOptions.length > 0) {
            alert('Please ensure all options have text values');
            return;
        }

        // Convert back to legacy format for compatibility
        const legacyOptions = options.map(opt => opt.text);
        const savedData = {
            question,
            questionType,
            options: legacyOptions,
            isRequired,
            optionsData: options // Include full option data for future use
        };

        console.log('💾 Modal saving data:', savedData);
        onSave(savedData);
    };

    const addOption = () => {
        setOptions([...options, {
            text: `New Option ${options.length + 1}`,
            score: undefined,
            referralText: ''
        }]);
    };

    const removeOption = (index: number) => {
        if (options.length > 1) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const updateOption = (index: number, field: keyof OptionData, value: string | number) => {
        const newOptions = [...options];

        if (field === 'score') {
            // Keep score as string to preserve decimal values like 0.1
            const scoreValue = value === '' ? undefined : value;
            newOptions[index] = { ...newOptions[index], score: scoreValue };
        } else {
            newOptions[index] = { ...newOptions[index], [field]: value };
        }

        setOptions(newOptions);
    };

    const showOptions = ['radio', 'checkbox'].includes(questionType);

    return (
        <div
            ref={modalRef}
            style={{
                position: 'fixed',
                left: '207px',
                top: '102px',
                width: '500px',
                // maxHeight: '90vh',
                background: 'white',
                border: '1px solid rgb(224, 224, 224)',
                borderRadius: '12px',
                boxShadow: 'rgba(0, 0, 0, 0.15) 0px 10px 25px',
                zIndex: 9999,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header - Draggable area */}
            <Box
                onMouseDown={handleHeaderMouseDown}
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 3,
                    py: 2.5,
                    backgroundColor: '#4baaf4',
                    borderRadius: '12px 12px 0 0',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    userSelect: 'none',
                    flexShrink: 0
                }}
            >
                <Typography sx={{
                    fontWeight: 600,
                    color: 'white',
                    fontSize: '18px',
                    pointerEvents: 'none'
                }}>
                    {isNewQuestion ? 'Add Question' : 'Edit Question'}
                </Typography>
                <IconButton
                    onClick={onCancel}
                    onMouseDown={(e) => e.stopPropagation()}
                    sx={{
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Content - No scroll, full height */}
            <Box sx={{
                p: 3
            }}>

                {/* Question Type */}
                <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: '12px', fontWeight: 500, mb: 1, color: '#374151' }}>
                        Question Type:
                    </Typography>
                    <select
                        value={questionType}
                        onChange={(e) => setQuestionType(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        {questionTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </Box>

                {/* Question */}
                <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: '12px', fontWeight: 500, mb: 1, color: '#374151' }}>
                        Question:
                    </Typography>
                    <TextField
                        fullWidth
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Enter your question here..."
                        multiline
                        rows={2}
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '6px',
                                backgroundColor: 'white',
                                fontSize: '14px'
                            }
                        }}
                    />
                </Box>

                {/* Required Question */}
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={isRequired}
                            onChange={(e) => setIsRequired(e.target.checked)}
                            size="small"
                            sx={{ color: '#4baaf4' }}
                        />
                    }
                    label={
                        <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#374151' }}>
                            Required Question
                        </Typography>
                    }
                    sx={{ mb: 2 }}
                />

                {/* Options */}
                {showOptions && (
                    <Box sx={{ mb: 2 }}>
                        <Typography sx={{ fontSize: '12px', fontWeight: 500, mb: 1, color: '#374151' }}>
                            Options:
                        </Typography>
                        {options.map((option, index) => {
                            console.log(`🔍 Rendering option ${index}:`, option);
                            console.log(`🔍 Option text value:`, option?.text);
                            console.log(`🔍 Option object keys:`, Object.keys(option || {}));
                            console.log(`🔍 Option text length:`, option?.text?.length);
                            console.log(`🔍 Option text trimmed:`, option?.text?.trim());

                            // Ensure option is properly defined
                            const safeOption = option || { text: '', score: undefined, referralText: '' };

                            return (
                            <Box key={`option-${index}`} sx={{
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                p: 2,
                                mb: 2,
                                backgroundColor: '#f9fafb'
                            }}>
                                {/* Option Text */}
                                <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
                                    <TextField
                                        fullWidth
                                        value={safeOption.text || ''}
                                        onChange={(e) => updateOption(index, 'text', e.target.value)}
                                        placeholder="Option text"
                                        size="small"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: 'white',
                                                fontSize: '14px',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#d1d5db'
                                                }
                                            }
                                        }}
                                    />
                                    <IconButton
                                        onClick={() => removeOption(index)}
                                        disabled={options.length <= 1}
                                        size="small"
                                        sx={{
                                            backgroundColor: '#fd5475',
                                            color: 'white',
                                            width: '32px',
                                            height: '32px',
                                            '&:hover': {
                                                backgroundColor: '#e63a5d'
                                            },
                                            '&:disabled': {
                                                backgroundColor: '#e5e7eb'
                                            }
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </IconButton>
                                </Box>

                                {/* Score and Referral Row */}
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    {/* Score Field */}
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontSize: '11px', fontWeight: 500, mb: 0.5, color: '#6b7280' }}>
                                            Score:
                                        </Typography>
                                        <TextField
                                            type="text"
                                            value={safeOption.score !== undefined ? safeOption.score : ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                // Allow empty, numbers, and decimal numbers
                                                if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                                    updateOption(index, 'score', val === '' ? '' : val);
                                                }
                                            }}
                                            placeholder="Enter score"
                                            size="small"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    backgroundColor: 'white',
                                                    fontSize: '13px',
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d1d5db'
                                                    },
                                                    '& input[type=number]': {
                                                        MozAppearance: 'textfield'
                                                    },
                                                    '& input[type=number]::-webkit-outer-spin-button': {
                                                        WebkitAppearance: 'none',
                                                        margin: 0
                                                    },
                                                    '& input[type=number]::-webkit-inner-spin-button': {
                                                        WebkitAppearance: 'none',
                                                        margin: 0
                                                    }
                                                }
                                            }}
                                        />
                                    </Box>

                                    {/* Referral Text Field */}
                                    <Box sx={{ flex: 2 }}>
                                        <Typography sx={{ fontSize: '11px', fontWeight: 500, mb: 0.5, color: '#6b7280' }}>
                                            Referral Text:
                                        </Typography>
                                        <TextField
                                            value={safeOption.referralText || ''}
                                            onChange={(e) => updateOption(index, 'referralText', e.target.value)}
                                            placeholder="e.g., Refer to Consultant"
                                            size="small"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    backgroundColor: 'white',
                                                    fontSize: '13px',
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d1d5db'
                                                    }
                                                }
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        );
                        })}

                        <Button
                            startIcon={<AddIcon />}
                            onClick={addOption}
                            variant="contained"
                            size="small"
                            sx={{
                                textTransform: 'none',
                                backgroundColor: '#4baaf4',
                                fontSize: '12px',
                                borderRadius: '4px',
                                mt: 1,
                                '&:hover': {
                                    backgroundColor: '#2196c9'
                                }
                            }}
                        >
                            Add Option
                        </Button>
                    </Box>
                )}

                {/* Option Connections Summary */}
                {showOptions && options.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 1, color: '#374151' }}>
                            Option Connections:
                        </Typography>
                        <Box sx={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            backgroundColor: '#f9fafb',
                            p: 1
                        }}>
                            {options.map((option, index) => {
                                const safeOption = option || { text: '', score: undefined, referralText: '' };
                                return (
                                    <Box key={`connection-${index}`} sx={{
                                        mb: 1,
                                        p: 1.5,
                                        backgroundColor: 'white',
                                        borderRadius: '4px',
                                        border: '1px solid #e5e7eb'
                                    }}>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>
                                            "{safeOption.text}"`
                                            {safeOption.score !== undefined && safeOption.score !== '' && (
                                                <span style={{ color: '#059669' }}> (Score: {safeOption.score})</span>
                                            )}
                                            {safeOption.referralText && safeOption.referralText.trim() && (
                                                <span style={{ color: '#dc2626' }}>
                                                    {safeOption.score !== undefined && safeOption.score !== '' ? ', ' : ' ('}
                                                    {safeOption.referralText}
                                                    {safeOption.score === undefined || safeOption.score === '' ? ')' : ''}
                                                </span>
                                            )} connects to:
                                        </Typography>
                                        <Typography sx={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
                                            Drag from the handle on the right to connect this option to next question.
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                )}

                {/* All Selected Dependencies for Checkbox removed as requested */}

                {/* Buttons */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 3,
                    pt: 2,
                    borderTop: '1px solid #e5e7eb'
                }}>
                    <Button
                        onClick={onCancel}
                        sx={{
                            backgroundColor: '#fd5475',
                            color: 'white',
                            px: 4,
                            py: 1,
                            borderRadius: '6px',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                                backgroundColor: '#e63a5d'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        sx={{
                            backgroundColor: '#4baaf4',
                            color: 'white',
                            px: 4,
                            py: 1,
                            borderRadius: '6px',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                                backgroundColor: '#2196c9'
                            }
                        }}
                    >
                        Save
                    </Button>
                </Box>
            </Box>
        </div>
    );
};

export default TemplateEditQuestionModal;
















