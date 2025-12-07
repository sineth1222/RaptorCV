import React, { useEffect, useState } from 'react'
import { useParams, Link, data, useLocation, useNavigate } from 'react-router-dom'
import { dummyResumeData } from '../assets/assets'
import { ArrowLeftIcon, Briefcase, ChevronLeft, ChevronRight, DownloadIcon, EyeIcon, EyeOffIcon, FileText, FolderIcon, GraduationCap, Share2Icon, Sparkles, User } from 'lucide-react'
import PersonalInfoForm from '../components/PersonalInfoForm'
import ResumePreview from '../components/ResumePreview'
import TemplateSelector from '../components/TemplateSelector'
import ColorPicker from '../components/ColorPicker'
import ProfetionalSummary from '../components/ProfetionalSummary'
import ExperinceForm from '../components/ExperinceForm'
import EducationForm from '../components/EducationForm'
import ProjectForm from '../components/ProjectForm'
import SkillsForm from '../components/SkillsForm'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import api from '../configs/api'
import ReferencesForm from '../components/ReferencesForm'
import LanguagesForm from '../components/LanguageForm'
//import ProjectForm from '../components/ProjectForm'

const ResumeBuilder = () => {

  const { resumeId } = useParams()
  const { token } = useSelector(state => state.auth)
  const location = useLocation()
  const navigate = useNavigate()

  const searchParams = new URLSearchParams(location.search);
  const initialTemplate = searchParams.get('template') || "classic";

  const [resumeData, setResumeData] = useState({
    _id: '',
    title: '',
    personal_info: {},
    experience: [],
    education: [],
    skills: [],
    project: [],
    template: initialTemplate,
    accent_color: "#3B82F6",
    public: false,
  })

  const createNewResume = async (templateId) => {
        try {
            const titleToSend = `${templateId.charAt(0).toUpperCase() + templateId.slice(1)} Resume`;
            
            // 1. New Resume එකක් Create කරන්න
            const { data } = await api.post('/api/resumes/create', { title: titleToSend }, { headers: { Authorization: token } });
            const newResumeId = data.resume._id;
            
            // 2. Template එක Update කරන්න
            await api.put('/api/resumes/update', { resumeId: newResumeId, resumeData: { template: templateId } }, { headers: { Authorization: token } });
            
            // 3. Current URL එක History එකේ Replace කරන්න
            // මෙයින් URL එක /app/builder/new?template=... වෙනුවට /app/builder/newResumeId බවට පත් කරයි
            navigate(`/app/builder/${newResumeId}`, { replace: true });

            // 4. State එක Update කරන්න
            setResumeData({ ...data.resume, template: templateId, _id: newResumeId });
            document.title = titleToSend;
            
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
            // Error වුවහොත් Dashboard එකට යවන්න
            navigate('/app'); 
        }
    }


    useEffect(() => {
        if (resumeId === 'new') {
            // New Resume එකක් නම්, Template ID එක සමඟ Create කරන්න
            toast.promise(createNewResume(initialTemplate), {
                loading: 'Creating new resume...',
                success: 'Resume created successfully!',
                error: 'Failed to create resume.',
            });
        } else {
            // Existing Resume එකක් නම්, load කරන්න
            loadExistingResume()
        }
    }, [resumeId])

  const loadExistingResume = async () => {
    try {
      const {data} = await api.get('/api/resumes/get/' + resumeId, {headers: {Authorization: token}})
      if(data.resume){
        setResumeData(data.resume)
        document.title = data.resume.title;
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const [removeBackground, setRemoveBackground] = useState(false);

  const sections = [
    { id: 'personal_info', name: 'Personal Information', icon:  User },
    { id: 'summary', name: 'Summary', icon:  FileText },
    { id: 'experience', name: 'Experience', icon:  Briefcase },
    { id: 'education', name: 'Education', icon:  GraduationCap },
    { id: 'projects', name: 'Projects', icon:  FolderIcon },
    { id: 'skills', name: 'Skills', icon:  Sparkles },
    { id: 'references', name: 'References', icon:  Sparkles },
    { id: 'languages', name: 'Languages', icon:  Sparkles },
  ]

  const activeSection = sections[activeSectionIndex];

  useEffect(()=>{
    loadExistingResume()
  },[])

  const changeResumeVisibility = async () => {
    //setResumeData({...resumeData, public: !resumeData.public})
    try {
      const formData = new FormData()
      formData.append("resumeId", resumeId)
      formData.append("resumeData", JSON.stringify({public: !resumeData.public}))

      const {data} = await api.put('/api/resumes/update', formData, {headers: {Authorization: token}})

      setResumeData({...resumeData, public: !resumeData.public})
      toast.success(data.message)

    } catch (error) {
      console.error("Errorr saving resume: ", error)
    }
  }

  const handleShare = () => {
    const frontendUrl = window.location.href.split('/app/')[0];
    const resumeUrl = frontendUrl + '/view/' + resumeId;

    if(navigator.share) {
      navigator.share({ url: resumeUrl, text: "My Resume", })
    } else {
      alert('Share not supported on this browser.')
    }
  }

  const downloadResume = () => {
    window.print();
  }

  const saveResume = async () => {
    try {
      let updatedResumeData = structuredClone(resumeData)

      //remove imge from update resume data
      if(typeof resumeData.personal_info.image === 'object'){
        delete updatedResumeData.personal_info.image
      } 

      const formData = new FormData();
      formData.append("resumeId", resumeId)
      formData.append("resumeData", JSON.stringify(updatedResumeData))
      removeBackground && formData.append("removeBackground", "yes");
      typeof resumeData.personal_info.image === 'object' && formData.append("image", resumeData.personal_info.image)

      const {data} = await api.put('/api/resumes/update', formData, {
        headers: {
          Authorization: token,
        }
      })

      setResumeData(data.resume)
      toast.success(data.message)

    } catch (error) {
      //console.error("Error in updateResume:", error);
      console.error("Error saving resume : ", error)
    }
  }


  return (
    <div>
      
      <div className='max-w-7xl mx-auto px-4 py-6'>
        <Link to={'/app'} className='inline-flex gap-2 items-center text-slate-500 hover:text-slate-700 transition-all'>
          <ArrowLeftIcon className='size-4 text-slate-600 hover:text-slate-800 transition-colors m-4'/> Back to Dashboard
        </Link>
      </div>

      <div className='max-w-7xl mx-auto px-4 pb-8'>
        <div className='grid lg:grid-cols-12 gap-8'>
          {/* Left Panel */}
          <div className='relative lg:col-span-5 rounded-lg overflow-hidden'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 pt-1'>
              {/* progress bar using activeSectionIndex */}
              <hr className='absolute top-0 left-0 right-0 border-2 border-gray-200'/>
              <hr className='absolute top-0 left-0 h-1 bg-linear-to-r from-green-500 to-green-600 border-none transition-all duration-2000'
              style={{width: `${activeSectionIndex * 100 / (sections.length - 1)}%`}}
              />

              {/*sections navigation */}
              <div className='flex justify-between items-center mb-6 border-b border-green-300 py-1'>

                <div className='flex justify-center gap-2'>
                  <TemplateSelector selectedTemplate={resumeData.template} onChange={(template)=> setResumeData(prev => ({...prev, template}))} />                 
                  <ColorPicker selectedColor={resumeData.accent_color} onChange={(color)=>setResumeData(prev => ({...prev, accent_color: color}))}/>
                </div>

                <div className='flex items-center'>
                  {activeSectionIndex !== 0 && (
                    <button onClick={()=> setActiveSectionIndex((prevIndex) => Math.max(prevIndex - 1, 0))} className='flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all' disabled={activeSectionIndex === 0}>
                      <ChevronLeft className='size-4' />Previous
                    </button>
                  )}
                  <button onClick={()=> setActiveSectionIndex((prevIndex) => Math.min(prevIndex + 1, sections.length - 1))} className={`flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all ${activeSectionIndex === sections.length - 1 && 'opacity-50 cursor-not-allowed'}`} disabled={activeSectionIndex === sections.length - 1}>
                      Next <ChevronRight className='size-4' />
                  </button>
                </div>
              </div>

              {/* form Content */}
              <div className='space-y-6'>
                {activeSection.id === 'personal_info' && (
                  <PersonalInfoForm data={resumeData.personal_info} onChange={(data) => setResumeData(prev => ({...prev, personal_info:data}))} removeBackground={removeBackground} setRemoveBackground={setRemoveBackground} />
                )}
                {activeSection.id === 'summary' && (
                  <ProfetionalSummary data={resumeData.professional_summary} onChange={(data)=> setResumeData(prev=> ({...prev, professional_summary: data}))} setResumeData={setResumeData}/>
                )}
                {activeSection.id === 'experience' && (
                  <ExperinceForm data={resumeData.experience} onChange={(data)=> setResumeData(prev=> ({...prev, experience: data}))}/>
                )}
                {activeSection.id === 'education' && (
                  <EducationForm data={resumeData.education} onChange={(data)=> setResumeData(prev=> ({...prev, education: data}))}/>
                )}
                {activeSection.id === 'projects' && (
                  <ProjectForm data={resumeData.project} onChange={(data)=> setResumeData(prev=> ({...prev, project: data}))}/>
                )}
                {activeSection.id === 'skills' && (
                  <SkillsForm data={resumeData.skills} onChange={(data)=> setResumeData(prev=> ({...prev, skills: data}))}/>
                )}
                {activeSection.id === 'references' && (
                  <ReferencesForm data={resumeData.references} onChange={(data)=> setResumeData(prev=> ({...prev, references: data}))}/>
                )}
                {activeSection.id === 'languages' && (
                  <LanguagesForm data={resumeData.languages} onChange={(data)=> setResumeData(prev=> ({...prev, languages: data}))}/>
                )}
              </div>
              <button onClick={()=> {toast.promise(saveResume, {loading: 'Saving...'})}} className='bg-linear-to-br from-green-100 to-green-200 ring-green-300 text-emerald-600 ring hover:ring-emerald-400 transition-all rounded-md px-6 py-2 mt-6 text-sm'>
                Save Changes
              </button>
            </div>
          </div>

          {/* Right Panel */}
          <div className='lg:col-span-7 max-lg:mt-6'>
            <div className='relative w-full'>
              {/* buttons */}
              <div className='absolute bottom-3 left-0 right-0 flex items-center justify-end gap-2'>
                {resumeData.public && (
                  <button onClick={handleShare} className='flex items-center p-2 px-4 gap-2 text-xs bg-linear-to-br from-blue-100 to-blue-200 text-blue-600 rounded-lg ring-blue-300 hover:ring transition-colors'>
                    <Share2Icon className='size-4' /> Share
                  </button>
                )}

                <button onClick={changeResumeVisibility} className='flex items-center p-2 px-4 gap-2 text-xs bg-linear-to-br from-purple-100 to-purple-200 text-purple-600 rounded-lg ring-purple-300 hover:ring transition-colors'>
                  {resumeData.public ? <EyeIcon className='size-4' /> : <EyeOffIcon className='size-4' /> }
                  {resumeData.public ? 'Public' : 'Private'}
                </button>

                <button onClick={downloadResume} className='flex items-center p-2 px-4 gap-2 text-xs bg-linear-to-br from-green-100 to-green-200 text-green-600 rounded-lg ring-green-300 hover:ring transition-colors'>
                  <DownloadIcon className='size-4' /> Download
                </button>
              </div>
            </div>

            {/* resume preview */}
            <ResumePreview data={resumeData} template={resumeData.template} accentColor={resumeData.accent_color} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResumeBuilder
