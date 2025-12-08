import { BaggageClaim, GraduationCap, LetterText, Plus, Trash2 } from 'lucide-react';
import React from 'react'

const ReferencesForm = ({ data, onChange }) => {

    const addReferences = ()=> {
        const newReferences = {
            name: "",
            title: "",
            company: "",
            contact: "",
        };
        onChange([...data, newReferences])
    }

    const removeReferences = (index) => {
        const update = data.filter((_, i)=> i !== index);
        onChange(update)
    }

    const updateReferences = (index, field, value) => {
        const update = [...data];
        update [index] = {...update[index], [field]: value}
        onChange(update)
    }


  return (
    <div className='space-y-6'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8 sm:gap-0'>
                <div className='flex flex-col items-center justify-center sm:block'>
                    <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'> References</h3>
                    <p className='text-sm text-gray-500'>Add your References details</p>
                </div>
                <button onClick={addReferences} className='flex items-center w-fit ml-auto sm:ml-0 gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors'>
                    <Plus className='size-4' />
                        Add References
                </button>
            </div>

            {data.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                    <LetterText className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                    <p>No References details added yet.</p>
                    <p className='text-sm'>Click "Add References" to get started.</p>
                </div>
            ) : (
                <div className='space-y-4'>
                    {data.map((References, index) => (
                        <div key={index} className='p-4 border border-gray-200 rounded-lg space-y-3'>
                            <div className='flex justify-between items-start'>
                                <h4>References #{index + 1}</h4>
                                <button onClick={()=> removeReferences(index)} className='text-red-500 hover:text-red-700 transition-colors'>
                                    <Trash2 className='size-4'/>
                                </button>
                            </div>

                            <div className='grid md:grid-cols-2 gap-3'>
                                <input value={References.name || ""} onChange={(e)=>updateReferences(index, "name", e.target.value)} type="text" placeholder='Reference Holder Name' className='px-3 py-2 text-sm rounded-lg' />

                                <input value={References.title || ""} onChange={(e)=>updateReferences(index, "title", e.target.value)} type="text" placeholder="Reference Holder Position" className='px-3 py-2 text-sm rounded-lg' />

                                <input value={References.company || ""} onChange={(e)=>updateReferences(index, "company", e.target.value)} type="text" className='px-3 py-2 text-sm rounded-lg' placeholder='Company Name'/>

                                <input value={References.contact || ""} onChange={(e)=>updateReferences(index, "contact", e.target.value)} type="text" className='px-3 py-2 text-sm rounded-lg' placeholder='Contact Details'/>
                            </div>

                        </div>
                    ))}
                </div>
            )}
      
    </div>
  )
}

export default ReferencesForm
