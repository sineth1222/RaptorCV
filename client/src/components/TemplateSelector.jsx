import { Check, Layout } from 'lucide-react'
import React, { useState } from 'react'

const TemplateSelector = ({ selectedTemplate, onChange}) => {

    const [isOpen, setIsOpen] = useState(false)

    /*const template = [
        {
            id: "classic",
            name: "Classic",
            preview: "A clean, traditional resume format with clear sections and professional typography"
        },
        {
            id: "modern",
            name: "Modern",
            preview: "Sleek design with strategic use of color and modern font choices"
        },
        {
            id: "minimal-image",
            name: "Minimal Image",
            preview: "Minimal design with a single image and clean typography"
        },
        {
            id: "minimal",
            name: "Minimal",
            preview: "Ultra-clean design that puts your content front and center"
        },
        {
            id: "simple-modern",
            name: "Modern Simple",
            preview: "Ultra-clean design that puts your content front and center"
        },
        {
            id: "traditional",
            name: "Traditional",
            preview: "Ultra-clean design that puts your content front and center"
        },
        {
            id: "natural",
            name: "Natural",
            preview: "Ultra-clean design that puts your content front and center"
        },
        {
            id: "strong",
            name: "Strong",
            preview: "Ultra-clean design that puts your content front and center"
        },
        {
            id: "professional",
            name: "Professional",
            preview: "Ultra-clean design that puts your content front and center"
        },
        {
            id: "official",
            name: "Official",
            preview: "Ultra-clean design that puts your content front and center"
        },
        {
            id: "mordern-image",
            name: "Mordern Image",
            preview: "Ultra-clean design that puts your content front and center"
        },
        {
            id: "mordern-image-new",
            name: "Calm Color",
            preview: "Ultra-clean design that puts your content front and center"
        },
        {
            id: "calm-sidebar",
            name: "Calm Sidebar",
            preview: "Ultra-clean design that puts your content front and center"
        },
    ]*/

    const template = [
        {
            id: "classic",
            name: "Classic",
            preview: "A clean, traditional resume format with clear sections and professional typography"
        },
        {
            id: "modern",
            name: "Modern",
            preview: "Sleek design with strategic use of color and modern font choices."
        },
        {
            id: "simple-modern",
            name: "Modern Simple",
            preview: "A sleek, clean format prioritizing readability and content flow." // යාවත්කාලීන කරන ලදි
        },
        {
            id: "mordern-image",
            name: "Mordern Image",
            preview: "Modern structure incorporating a photo for a more personal touch." // යාවත්කාලීන කරන ලදි
        },
        {
            id: "strong",
            name: "Strong",
            preview: "Uses bold headings and lines to create a strong visual hierarchy." // යාවත්කාලීන කරන ලදි
        },
        {
            id: "mordern-image-new",
            name: "Calm",
            preview: "A clean, modern design with subtle, calming color accents." // යාවත්කාලීන කරන ලදි
        },
        {
            id: "calm-sidebar",
            name: "Calm Sidebar",
            preview: "Distinct two-column format with a dedicated, light sidebar for key info." // යාවත්කාලීන කරන ලදි
        },
        {
            id: "traditional",
            name: "Traditional",
            preview: "Strictly formal layout, ideal for conservative or academic fields." // යාවත්කාලීන කරන ලදි
        },
        {
            id: "natural",
            name: "Natural",
            preview: "Soft tones and balanced spacing for a relaxed, easy-to-read feel." // යාවත්කාලීන කරන ලදි
        },
        {
            id: "professional",
            name: "Professional",
            preview: "A polished, one-page layout optimized for quick professional review." // යාවත්කාලීන කරන ලදි
        },
        {
            id: "official",
            name: "Official",
            preview: "Highly structured, formal style with minimal decoration and color." // යාවත්කාලීන කරන ලදි
        },
        {
            id: "minimal-image",
            name: "Minimal Image",
            preview: "Minimal design with a single image and clean typography."
        },
        {
            id: "minimal",
            name: "Minimal",
            preview: "Ultra-clean design that puts your content front and center."
        },
    ]

  return (
    <div className='relative'>
        <button onClick={()=> setIsOpen(!isOpen)} className='flex items-center gap-1 text-sm text-blue-600 bg-linear-to-br from-blue-50 to-blue-100 ring-blue-300 hover:ring transition-all px-3 py-2 rounded-lg'>
            <Layout size={14} /> <span className='max-sm:hidden'>Template</span>
        </button>
        {isOpen && (
            <div className='absolute top-full w-xs p-3 mt-2 space-y-3 z-10 bg-white rounded-md border border-gray-200 shadow-sm max-h-80 overflow-y-auto scrollbar-thin'>
                {template.map((template)=> (
                    <div key={template.id} onClick={()=> {onChange(template.id); setIsOpen(false)}} className={`relative p-3 border rounded-md cursor-pointer transition-all ${selectedTemplate === template.id ? "border-blue-400 bg-blue-100" 
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-100"
                    }`}>
                        {selectedTemplate === template.id && (
                            <div className='absolute top-2 right-2'>
                                <div className='size-5 bg-blue-400 rounded-full flex items-center justify-center'>
                                    <Check className='w-3 h-3 text-white' />
                                </div>
                            </div>
                        )}
                        <div className='space-y-1'>
                            <h4 className='font-medium text-gray-800'>{template.name}</h4>
                            <div className='mt-2 p-2 bg-blue-50 rounded text-xs text-gray-500 italic'>{template.preview}</div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  )
}

export default TemplateSelector
