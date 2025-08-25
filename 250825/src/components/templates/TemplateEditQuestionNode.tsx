import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Box, TextField, Checkbox, FormControlLabel, Button, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { Trash2 } from 'lucide-react';

interface OptionData {
    text: string;
    score?: number | string;
    referralText?: string; // Custom referral text instead of predefined types
}

interface EditQuestionNodeData {
    question: string;
    questionType: string;
    options: string[] | OptionData[];
    isRequired: boolean;
    isNewQuestion: boolean;
    onSave: (data: any) => void;
    onCancel: () => void;
}

interface EditQuestionNodeProps {
    data: EditQuestionNodeData;
    id: string;
}

const TemplateEditQuestionNode: React.FC<EditQuestionNodeProps> = ({ data, id }) => {
    const [question, setQuestion] = useState(data.question || '');
    const [questionType, setQuestionType] = useState(data.questionType || 'text-input');

    // Convert legacy string options to new OptionData format
    const convertToOptionData = (opts: string[] | OptionData[]): OptionData[] => {
        console.log('🔄 TemplateEditQuestionNode - Converting options:', opts);

        if (!opts || opts.length === 0) {
            console.log('📝 No options provided, using defaults');
            return [
                { text: 'Enter option text here', score: undefined, referralText: '' },
                { text: 'Enter option text here', score: undefined, referralText: '' }
            ];
        }

        const converted = opts.map((opt) => {
            if (typeof opt === 'string') {
                console.log('📝 Converting string option:', opt);
                return { text: opt, score: undefined, referralText: '' };
            }
            console.log('📝 Using existing OptionData:', opt);
            return opt;
        });

        console.log('✅ Converted options:', converted);
        return converted;
    };

    const [options, setOptions] = useState<OptionData[]>(convertToOptionData(data.options));
    const [isRequired, setIsRequired] = useState(data.isRequired || false);
    const [lastValidOptions, setLastValidOptions] = useState<OptionData[]>(convertToOptionData(data.options));

    // Update state when data changes (important for edit mode)
    React.useEffect(() => {
        console.log('📝 TemplateEditQuestionNode - data changed:', data);
        setQuestion(data.question || '');
        setQuestionType(data.questionType || 'text-input');
        const convertedOptions = convertToOptionData(data.options);
        setOptions(convertedOptions);
        setLastValidOptions(convertedOptions);
        setIsRequired(data.isRequired || false);
    }, [data]);

    const questionTypes = [
        { value: 'text-input', label: 'Text Input' },
        { value: 'radio', label: 'Radio' },
        { value: 'checkbox', label: 'Checkbox' }
    ];

    // Update options when question type changes
    React.useEffect(() => {
        if (questionType === 'text-input') {
            setOptions([]);
        } else if (options.length === 0) {
            // If we have last valid options, restore them; otherwise use defaults
            if (lastValidOptions.length > 0) {
                setOptions(lastValidOptions);
            } else {
                setOptions([
                    { text: 'Enter option text here', score: undefined, referralText: '' },
                    { text: 'Enter option text here', score: undefined, referralText: '' }
                ]);
            }
        }
    }, [questionType, options.length, lastValidOptions]);

    const handleSave = () => {
        if (!question.trim()) {
            alert('Please enter a question');
            return;
        }

        // Validate that options are provided for question types that require them
        if (['radio', 'checkbox'].includes(questionType)) {
            if (!options || options.length === 0) {
                alert('Please add at least one option for this question type');
                return;
            }
            
            // Check if all options have text
            const validOptions = options.filter(opt => opt.text && opt.text.trim() !== '');
            if (validOptions.length === 0) {
                alert('Please enter text for at least one option');
                return;
            }
        }

        console.log('🔍 TemplateEditQuestionNode - Current options state:', options);
        console.log('🔍 TemplateEditQuestionNode - Options length:', options.length);
        console.log('🔍 TemplateEditQuestionNode - Question type:', questionType);
        console.log('🔍 TemplateEditQuestionNode - Show options:', showOptions);
        
        // Ensure options are available for question types that require them
        let finalOptions = options;
        if (['radio', 'checkbox'].includes(questionType) && (!options || options.length === 0)) {
            console.log('🔍 No options found, creating default options');
            finalOptions = [
                { text: 'Option 1', score: undefined, referralText: '' },
                { text: 'Option 2', score: undefined, referralText: '' }
            ];
        }
        
        // Convert back to legacy format for compatibility
        const legacyOptions = finalOptions.map(opt => opt.text);
        console.log('🔍 TemplateEditQuestionNode - Extracted legacyOptions:', legacyOptions);
        console.log('🔍 TemplateEditQuestionNode - Legacy options length:', legacyOptions.length);
        
        const savedData = {
            question,
            questionType,
            options: legacyOptions,
            isRequired,
            optionsData: finalOptions // Include full option data for future use
        };

        console.log('💾 TemplateEditQuestionNode saving data:', savedData);

        // Call the onSave function passed from parent
        if (data.onSave) {
            data.onSave(savedData);
        }
    };

    const handleCancel = () => {
        //console.log('Canceling question edit');

        // Call the onCancel function passed from parent
        if (data.onCancel) {
            data.onCancel();
        }
    };

    const addOption = () => {
        const newOptions = [...options, {
            text: `Enter option text here`,
            score: undefined,
            referralText: ''
        }];
        setOptions(newOptions);
        setLastValidOptions(newOptions);
    };

    const removeOption = (index: number) => {
        if (options.length > 1) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
            setLastValidOptions(newOptions);
        }
    };

    const updateOption = (index: number, field: keyof OptionData, value: string | number) => {
        console.log(`🔍 updateOption called - index: ${index}, field: ${field}, value:`, value);
        console.log(`🔍 Current options before update:`, options);
        
        const newOptions = [...options];

        if (field === 'score') {
            // Keep score as string to preserve decimal values like 0.1
            const scoreValue = value === '' ? undefined : value;
            newOptions[index] = { ...newOptions[index], score: scoreValue };
        } else {
            newOptions[index] = { ...newOptions[index], [field]: value };
        }

        console.log(`🔍 New options after update:`, newOptions);
        setOptions(newOptions);
        
        // Update lastValidOptions if this is a valid option (has text)
        if (field === 'text' && value && typeof value === 'string' && value.trim() !== '') {
            console.log(`🔍 Updating lastValidOptions with:`, newOptions);
            setLastValidOptions(newOptions);
        }
    };

    const showOptions = ['radio', 'checkbox'].includes(questionType);

    return (
        <Box sx={{
            background: 'white',
            border: '2px solid #4baaf4',
            borderRadius: '12px',
            minWidth: '400px',
            maxWidth: '450px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            overflow: 'visible',
            position: 'relative',
            zIndex: 1000
        }}>
            <Handle type="target" position={Position.Top} style={{ background: '#4baaf4' }} />

            {/* Header */}
            <Box sx={{
                background: '#4baaf4',
                color: 'white',
                padding: '15px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: '10px 10px 0 0'
            }}>
                <Typography sx={{
                    fontSize: '18px',
                    fontWeight: '700'
                }}>
                    {data.isNewQuestion ? ' Add Question' : ' Edit Question'}
                </Typography>
                <IconButton
                    onClick={handleCancel}
                    sx={{
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Content */}
            <Box sx={{ padding: '20px' }}>
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
                        {options.map((option, index) => (
                            <Box key={index} sx={{
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
                                        value={option.text}
                                        onChange={(e) => updateOption(index, 'text', e.target.value)}
                                        placeholder="Option text"
                                        size="small"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: 'white',
                                                fontSize: '14px'
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
                                            value={option.score !== undefined ? option.score : ''}
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
                                            value={option.referralText || ''}
                                            onChange={(e) => updateOption(index, 'referralText', e.target.value)}
                                            placeholder="e.g., Refer to Consultant"
                                            size="small"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    backgroundColor: 'white',
                                                    fontSize: '13px'
                                                }
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        ))}

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

                {/* Buttons */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 3,
                    pt: 2,
                    borderTop: '1px solid #e5e7eb'
                }}>
                    <Button
                        onClick={handleCancel}
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
            <Handle type="source" position={Position.Bottom} style={{ background: '#4baaf4' }} />
        </Box>
    );
};

export default TemplateEditQuestionNode;



