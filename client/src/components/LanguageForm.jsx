import { Languages, Plus, Trash2 } from 'lucide-react';
import React from 'react'

// 💡 ඔබට අවශ්‍ය language proficiency levels මෙහි සඳහන් කරන්න.
const languageLevels = [
    { value: "Native", label: "Native" },
    { value: "Fluent", label: "Fluent" },
    { value: "Proficient", label: "Proficient" }, // කලින් 'Professional Working Proficiency'
    { value: "Conversational", label: "Conversational" }, // කලින් 'Limited Working Proficiency'
    { value: "Basic", label: "Basic" }, // කලින් 'Elementary Proficiency'
];

const LanguagesForm = ({ data, onChange }) => {

    // ➕ අලුත් language එකක් එකතු කිරීමේ function එක
    const addLanguage = ()=> {
        const newLanguage = {
            language: "", 
            level: "", // default level එක හිස්ව තබයි
        };
        onChange([...data, newLanguage]) 
    }

    // 🗑️ language එකක් ඉවත් කිරීමේ function එක
    const removeLanguage = (index) => {
        const update = data.filter((_, i)=> i !== index);
        onChange(update)
    }

    // ✏️ language details update කිරීමේ function එක
    const updateLanguage = (index, field, value) => {
        const update = [...data];
        update [index] = {...update[index], [field]: value}
        onChange(update)
    }


  return (
    <div className='space-y-6'>
        {/* Header සහ Add Button එක */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8 sm:gap-0'>
            <div className='flex flex-col items-center justify-center sm:block'>
                <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
                    <Languages className='size-5' /> 
                    Languages
                </h3>
                <p className='text-sm text-gray-500'>Add the languages you know</p>
            </div>
            <button onClick={addLanguage} className='flex items-center w-fit ml-auto sm:ml-0 gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors'>
                <Plus className='size-4' />
                Add Language
            </button>
        </div>

        {/* Data නොමැති විට පෙන්වන UI එක */}
        {data.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
                <Languages className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                <p>No language details added yet.</p>
                <p className='text-sm'>Click "Add Language" to get started.</p>
            </div>
        ) : (
            // Data ඇති විට පෙන්වන UI එක
            <div className='space-y-4'>
                {data.map((lang, index) => (
                    <div key={index} className='p-4 border border-gray-200 rounded-lg space-y-3'>
                        <div className='flex justify-between items-start'>
                            <h4>Language #{index + 1}</h4>
                            <button onClick={()=> removeLanguage(index)} className='text-red-500 hover:text-red-700 transition-colors'>
                                <Trash2 className='size-4'/>
                            </button>
                        </div>

                        <div className='grid md:grid-cols-2 gap-3'>
                            {/* Language Name input එක */}
                            <input 
                                value={lang.language || ""} 
                                onChange={(e)=>updateLanguage(index, "language", e.target.value)} 
                                type="text" 
                                placeholder='Language Name (e.g., Sinhala)' 
                                className='px-3 py-2 text-sm rounded-lg border w-full' 
                            />

                            {/* 💡 Proficiency Level dropdown එක */}
                            <select
                                value={lang.level || ""}
                                onChange={(e) => updateLanguage(index, "level", e.target.value)}
                                className='px-3 py-2 text-sm rounded-lg border w-full bg-white'
                            >
                                <option value="" disabled>Select Proficiency Level</option>
                                {languageLevels.map((levelOption) => (
                                    <option key={levelOption.value} value={levelOption.value}>
                                        {levelOption.label}
                                    </option>
                                ))}
                            </select>

                        </div>
                    </div>
                ))}
            </div>
        )}
      
    </div>
  )
}

export default LanguagesForm;