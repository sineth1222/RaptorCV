import React from 'react'
import ModernTemplate from './templates/ModernTemplate';
import MinimalTemplate from './templates/MinimalTemplate';
import MinimalImageTemplate from './templates/MinimalImageTemplate';
import ClassicTemplate from './templates/ClassicTemplate';
import SimpleModernTemplate from './templates/SimpleModernTemplate';
import TraditionalResumeTempalte from './templates/TraditionalResumeTempalte';
import NaturalTemplate from './templates/NaturalTemplate';
import StrongTemplate from './templates/StrongTemplate';
import ProfessionalTemplate from './templates/ProfetionalTemplate';
import ModernSidebarTemplate from './templates/ProfessionalImagetemplate';
import MordernImageTemplate from './templates/MordernImageTemplate';
import ImageAccurateTemplate from './templates/MordernImageNewTemplate';
import CalmSidebarTemplate from './templates/CalmSidebarTemplate';

const ResumePreview = ({data, template, accentColor, classes = ""}) => {

    const rendertemplate = ()=>{
        switch (template) {
            case "modern":
                return <ModernTemplate data={data} accentColor={accentColor}/>;
            case "minimal":
                return <MinimalTemplate data={data} accentColor={accentColor}/>;
            case "minimal-image":
                return <MinimalImageTemplate data={data} accentColor={accentColor}/>;
            case "simple-modern":
                return <SimpleModernTemplate data={data} accentColor={accentColor}/>;
            case "traditional":
                return <TraditionalResumeTempalte data={data} accentColor={accentColor}/>;
            case "natural":
                return <NaturalTemplate data={data} accentColor={accentColor}/>;
            case "strong":
                return <StrongTemplate data={data} accentColor={accentColor}/>;
            case "professional":
                return <ProfessionalTemplate data={data} accentColor={accentColor}/>;
            case "official":
                return <ModernSidebarTemplate data={data} accentColor={accentColor}/>;
            case "mordern-image":
                return <MordernImageTemplate data={data} accentColor={accentColor}/>;
            case "mordern-image-new":
                return <ImageAccurateTemplate data={data} accentColor={accentColor}/>;
            case "calm-sidebar":
                return <CalmSidebarTemplate data={data} accentColor={accentColor}/>;
        
        
            default:
                return <ClassicTemplate data={data} accentColor={accentColor}/>;
        }
    }
  return (
    <div className='w-full bg-gray-100'>
        <div id='resume-preview' className={'border border-gray-200 print:shadow-none print:border-none' + classes}>
            {rendertemplate()}
        </div>

        <style jsx>
            {`
            @page{
                size: letter;
                margin: 0;
            }
            @media print{
                html, body{
                    width: 8.5in;
                    height: 11in;
                    overflow: hidden;
                }
                body * {
                    visibility: hidden;
                }
                #resume-preview, #resume-preview * {
                    visibility: visible;
                }
                #resume-preview {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: auto;
                    margin: 0;
                    padding: 0;
                    box-shadow: none !important;
                    border: none !important;
                }
            }`
            }
        </style>
      
    </div>
  )
}

export default ResumePreview
