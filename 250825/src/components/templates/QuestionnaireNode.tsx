import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import { Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EditQuestionModal from './TemplateEditQuestionModal';

interface OptionData {
    text: string;
    score?: number | string;
    referralText?: string; // Custom referral text instead of predefined types
}

interface QuestionNodeData {
    question: string;
    questionType: 'text-input' | 'multiple-choice' | 'radio' | 'checkbox' | 'yes-no' | 'select';
    options: string[];
    optionsData?: OptionData[]; // Enhanced option data
    isRequired: boolean;
    onUpdate: (id: string, newData: any) => void;
    onDelete: (id: string) => void;
    onUpdateEdgeLabels?: (nodeId: string, newOptions: string[]) => void;
}

interface QuestionNodeProps {
    data: QuestionNodeData;
    id: string;
    selected?: boolean;
}

const QuestionnaireNode: React.FC<QuestionNodeProps> = ({ data, id, selected = false }) => {
    const [showEditModal, setShowEditModal] = useState(!data.question);
    const [nodePosition, setNodePosition] = useState({ x: 0, y: 0 });
    const nodeRef = useRef<HTMLDivElement>(null);
    const { question, questionType, options, optionsData, isRequired } = data;

    // Get node position for modal placement
    useEffect(() => {
        if (nodeRef.current && showEditModal) {
            const rect = nodeRef.current.getBoundingClientRect();
            const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();

            if (reactFlowBounds) {
                setNodePosition({
                    x: rect.right - reactFlowBounds.left + 30, // Consistent 30px gap from right edge
                    y: rect.top - reactFlowBounds.top - 10 // Consistent 10px above the node
                });
            }
        }
    }, [showEditModal]);

    const getQuestionTypeLabel = () => {
        switch (questionType) {
            case 'text-input': return 'TEXT INPUT';
            case 'multiple-choice': return 'MULTIPLE CHOICE';
            case 'radio': return 'RADIO';
            case 'checkbox': return 'CHECKBOX';
            case 'yes-no': return 'YES/NO';
            case 'select': return 'SELECT';
            default: return 'QUESTION';
        }
    };

    const handleSave = (newData: any) => {
        console.log('💾 QuestionnaireNode received save data:', newData);
        
        // Check if required functions exist
        if (!data.onUpdate) {
            console.error('❌ QuestionnaireNode: onUpdate function is missing!');
            console.error('❌ Available data keys:', Object.keys(data));
            console.error('❌ Data object:', data);
            alert('Error: Cannot save question. Please refresh the page and try again.');
            return;
        }
        
        // No need to preserve old options - use the new ones from the modal
        
        const dataToSave = {
            ...newData,
            // Use the new options from the modal
            options: newData.options || [],
            // Ensure optionsData is properly set
            optionsData: newData.optionsData || []
        };

        console.log('💾 Saving data to node:', dataToSave);
        console.log('💾 Options to save:', dataToSave.options);
        console.log('💾 OptionsData to save:', dataToSave.optionsData);

        // Update the node data first
        data.onUpdate(id, dataToSave);

        // Update connected edge labels if options changed
        if (dataToSave.options && data.onUpdateEdgeLabels) {
            data.onUpdateEdgeLabels(id, dataToSave.options);
        }

        setShowEditModal(false);
    };


    const handleDelete = () => {
        if (!data.onDelete) {
            console.error('❌ QuestionnaireNode: onDelete function is missing!');
            console.error('❌ Available data keys:', Object.keys(data));
            alert('Error: Cannot delete question. Please refresh the page and try again.');
            return;
        }
        data.onDelete(id);
    };

    const handleEdit = () => {
        setShowEditModal(true);
    };

    const updateConnectedEdgeLabels = (nodeId: string, newOptions: string[]) => {
        // This function should be passed from the parent component
        if (data.onUpdateEdgeLabels) {
            data.onUpdateEdgeLabels(nodeId, newOptions);
        }
    };

    // Debug logging for options
    console.log('🔍 QuestionnaireNode render - questionType:', questionType);
    console.log('🔍 QuestionnaireNode render - options:', options);
    console.log('🔍 QuestionnaireNode render - optionsData:', optionsData);
    console.log('🔍 QuestionnaireNode render - question:', question);

    return (
        <>
            <Box
                ref={nodeRef}
                sx={{
                    background: '#f0f2f3',
                    border: '2px solid #4baaf4',
                    borderRadius: '12px',
                    minWidth: '280px',
                    maxWidth: '350px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    overflow: 'visible',
                    position: 'relative'
                }}
            >
                {/* Input Handle */}
                <Handle
                    type="target"
                    position={Position.Top}
                    style={{
                        background: '#4baaf4',
                        width: '12px',
                        height: '12px',
                        border: '2px solid white',
                        borderRadius: '50%',
                        top: '-18px',
                        zIndex: 100,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                />

                {/* Header */}
                <Box sx={{
                    background: '#4baaf4',
                    color: 'white',
                    padding: '12px 15px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: '10px 10px 0 0',
                    position: 'relative'
                }}>
                    <Box sx={{
                        fontSize: '12px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        {getQuestionTypeLabel()}
                        {isRequired && <span style={{ color: '#ff4444', marginLeft: '4px', fontWeight: 'bold' }}>*</span>}
                    </Box>
                    <Box sx={{ display: 'flex', gap: '4px' }}>
                        <IconButton
                            size="small"
                            onClick={handleEdit}
                            sx={{
                                color: 'white',
                                background: 'rgba(255,255,255,0.2)',
                                width: '24px',
                                height: '24px',
                                '&:hover': { background: 'rgba(255,255,255,0.3)' }
                            }}
                        >
                            <EditIcon sx={{ fontSize: '14px' }} />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={handleDelete}
                            sx={{
                                color: 'white',
                                background: 'rgba(255,255,255,0.2)',
                                width: '24px',
                                height: '24px',
                                '&:hover': { background: 'rgba(255,255,255,0.3)' }
                            }}
                        >
                            <DeleteIcon sx={{ fontSize: '14px' }} />
                        </IconButton>
                    </Box>
                </Box>

                {/* Content */}
                <Box sx={{ padding: '15px' }}>
                    <Box sx={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#4baaf4',
                        marginBottom: '8px',
                        lineHeight: '1.3'
                    }}>
                        {question || 'Untitled Question'}
                    </Box>

                                    {/* Show options for applicable question types */}
                {['multiple-choice', 'checkbox', 'radio', 'select'].includes(questionType) && options && (
                    <Box sx={{ fontSize: '13px', color: '#666' }}>
                        <Box sx={{ fontWeight: '600', marginBottom: '4px' }}>Options:</Box>
                        <Box component="ul" sx={{ margin: '0', paddingLeft: '15px' }}>
                            {options.map((option, index) => {
                                const optionData = optionsData?.[index];
                                console.log(`🔍 Rendering option ${index}:`, option, 'with data:', optionData);
                                return (
                                    <Box component="li" key={index} sx={{ marginBottom: '2px', fontWeight: '500' }}>
                                        {option}
                                        {optionData?.score !== undefined && optionData.score !== '' && (
                                            <span style={{ color: '#059669', fontSize: '11px', marginLeft: '8px' }}>
                                                (Score: {optionData.score})
                                            </span>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                )}

                    {questionType === 'yes-no' && (
                        <Box sx={{ fontSize: '13px', color: '#666' }}>
                            <Box sx={{ fontWeight: '600' }}>Yes / No options</Box>
                        </Box>
                    )}

                    {questionType === 'text-input' && (
                        <Box sx={{ fontSize: '13px', color: '#666' }}>
                            <Box sx={{ fontWeight: '600' }}>Text input field</Box>
                        </Box>
                    )}
                </Box>

                {/* Output Handles */}
                {questionType === 'text-input' && (
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="text-output"
                        style={{
                            background: '#4baaf4',
                            width: '12px',
                            height: '12px',
                            border: '2px solid white',
                            borderRadius: '50%',
                            right: '-6px',
                            top: '85px',
                            zIndex: 100,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}
                    />
                )}

                {questionType === 'yes-no' && (
                    <>
                        <Handle
                            type="source"
                            position={Position.Right}
                            id="yes"
                            style={{
                                background: '#4baaf4',
                                width: '12px',
                                height: '12px',
                                border: '2px solid white',
                                borderRadius: '50%',
                                right: '-6px',
                                top: '85px',
                                zIndex: 100,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                            }}
                        />
                        <Handle
                            type="source"
                            position={Position.Right}
                            id="no"
                            style={{
                                background: '#4baaf4',
                                width: '12px',
                                height: '12px',
                                border: '2px solid white',
                                borderRadius: '50%',
                                right: '-6px',
                                top: '105px',
                                zIndex: 100,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                            }}
                        />
                    </>
                )}

                {/* Individual option handles for multiple-choice, radio, and select */}
                {['multiple-choice', 'radio', 'select'].includes(questionType) && options &&
                    options.map((option, index) => (
                        <Handle
                            key={`option-${index}`}
                            type="source"
                            position={Position.Right}
                            id={`option-${index}`}
                            style={{
                                background: '#4baaf4',
                                width: '12px',
                                height: '12px',
                                border: '2px solid white',
                                borderRadius: '50%',
                                right: '-6px',
                                top: `${85 + (index * 20)}px`,
                                zIndex: 100,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                            }}
                        />
                    ))
                }

                {/* Checkbox handles - individual options + All Selected */}
                {questionType === 'checkbox' && options && (
                    <>
                        {/* Individual option handles */}
                        {options.map((option, index) => (
                            <Handle
                                key={`option-${index}`}
                                type="source"
                                position={Position.Right}
                                id={`option-${index}`}
                                style={{
                                    background: '#4baaf4',
                                    width: '12px',
                                    height: '12px',
                                    border: '2px solid white',
                                    borderRadius: '50%',
                                    right: '-6px',
                                    top: `${85 + (index * 18)}px`,
                                    zIndex: 100,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                }}
                            />
                        ))}

                        {/* All Selected handle */}
                        {options.length >= 2 && (
                            <Handle
                                type="source"
                                position={Position.Right}
                                id="multi-all"
                                style={{
                                    background: '#4caf50',
                                    width: '14px',
                                    height: '14px',
                                    border: '2px solid white',
                                    borderRadius: '50%',
                                    right: '-7px',
                                    top: `${85 + options.length * 18 + 10}px`,
                                    zIndex: 100,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                }}
                            />
                        )}
                    </>
                )}
            </Box>

            {/* Edit Modal positioned relative to node */}
            {showEditModal && (() => {
                // Ensure we pass valid option data to the modal with proper score binding
                let finalOptions;
                
                console.log('🔍 QuestionnaireNode opening modal with:');
                console.log('🔍 options:', options);
                console.log('🔍 optionsData:', optionsData);
                
                if (optionsData && Array.isArray(optionsData) && optionsData.length > 0) {
                    // Check if optionsData has valid text properties
                    const firstOptionData = optionsData[0];
                    if (typeof firstOptionData === 'object' && firstOptionData !== null && 
                        'text' in firstOptionData && firstOptionData.text !== undefined && firstOptionData.text !== '') {
                        // optionsData is valid, use it directly
                        console.log('🎯 QuestionnaireNode using valid optionsData:', optionsData);
                        finalOptions = optionsData;
                    } else {
                        // optionsData is corrupted (missing text), reconstruct from options array
                        console.log('⚠️ QuestionnaireNode optionsData corrupted, reconstructing from options array');
                        finalOptions = options.map((opt: any, index) => {
                            if (typeof opt === 'string') {
                                // Find corresponding score from optionsData if available
                                const scoreData = optionsData[index];
                                return { 
                                    text: opt, 
                                    score: scoreData?.score || undefined, 
                                    referralText: scoreData?.referralText || '' 
                                };
                            } else if (typeof opt === 'object' && opt !== null) {
                                // Option is already an object, preserve score and referralText
                                return {
                                    text: opt.text || `Option ${index + 1}`,
                                    score: opt.score || undefined,
                                    referralText: opt.referralText || ''
                                };
                            }
                            return { text: `Option ${index + 1}`, score: undefined, referralText: '' };
                        });
                    }
                } else {
                    // No optionsData, reconstruct from original options array
                    console.log('🎯 QuestionnaireNode reconstructing from original options:', options);
                    finalOptions = options.map((opt: any, index) => {
                        if (typeof opt === 'string') {
                            return { text: opt, score: undefined, referralText: '' };
                        } else if (typeof opt === 'object' && opt !== null) {
                            // Preserve any existing score/referralText data
                            return {
                                text: opt.text || opt.toString() || `Option ${index + 1}`,
                                score: opt.score || undefined,
                                referralText: opt.referralText || ''
                            };
                        }
                        return { text: `Option ${index + 1}`, score: undefined, referralText: '' };
                    });
                }

                console.log('🚀 QuestionnaireNode passing finalOptions to modal:', finalOptions);
                console.log('🚀 Final options details:', finalOptions.map((opt, idx) => ({
                    index: idx,
                    text: opt.text,
                    score: opt.score,
                    referralText: opt.referralText
                })));

                return (
                    <EditQuestionModal
                        questionData={{
                            question,
                            questionType,
                            options: finalOptions,
                            isRequired
                        }}
                        onSave={handleSave}
                        onCancel={() => setShowEditModal(false)}
                        isNewQuestion={false}
                        nodePosition={nodePosition}
                    />
                );
            })()}
        </>
    );
};

export default QuestionnaireNode;