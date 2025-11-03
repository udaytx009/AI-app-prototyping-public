import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import brain from "brain";
import { ProfileResponse } from "types";
import { useUserGuardContext } from "app/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "components/Header";
import { Button } from "@/components/ui/button";
import {
  User,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  Link as LinkIcon,
  Github,
  Linkedin,
  Image,
  Video,
  Code,
  Frown,
  Download,
} from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import html2pdf from 'html2pdf.js';

const ProfileSkeleton = () => (
  <div className="w-full h-full p-4 md:p-8 space-y-8">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12 flex flex-col items-center">
        <Skeleton className="w-32 h-32 rounded-full mb-4" />
        <Skeleton className="h-12 w-1/2 mb-2" />
        <Skeleton className="h-6 w-3/4" />
      </div>
      <div className="flex overflow-x-auto snap-x snap-mandatory space-x-8 pb-8 scrollbar-hide">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="snap-center flex-shrink-0 w-full md:w-1/2 lg:w-1/3">
            <Card className="glassmorphic h-full">
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const iconMap: { [key: string]: React.ReactNode } = {
  github: <Github className="h-4 w-4" />,
  linkedin: <Linkedin className="h-4 w-4" />,
  default: <LinkIcon className="h-4 w-4" />,
};

const getIcon = (url: string) => {
  if (url.includes("github.com")) return iconMap.github;
  if (url.includes("linkedin.com")) return iconMap.linkedin;
  return iconMap.default;
};

type Section = "about" | "work" | "education" | "media" | "code";

const ProfileDisplay = () => {
  const [searchParams] = useSearchParams();
  const { user: currentUser } = useUserGuardContext();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<Section>("about");
  const profileContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      const userIdFromUrl = searchParams.get("userId");

      try {
        let response;
        if (userIdFromUrl) {
          response = await brain.get_profile_by_id({ userId: userIdFromUrl });
        } else {
          response = await brain.get_my_profile();
        }

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else if (response.status === 404) {
          if (!userIdFromUrl) {
            // Current user's profile doesn't exist, redirect to create it
            navigate("/ProfileCompletion");
          } else {
            // The requested profile (from URL) does not exist
            setError("The requested profile could not be found.");
          }
        } else {
          // Handle other errors (e.g., 500)
          const errorData = await response.json();
          setError(errorData.detail || `An error occurred: ${response.statusText}`);
        }
      } catch (err) {
        setError("An unexpected error occurred while fetching the profile.");
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [searchParams, navigate]);

  const handleDownloadPdf = () => {
    const element = profileContainerRef.current;
    if (!element || !profile) return;

    // Select the card container
    const cardContainer = element.querySelector('#pdf-card-container') as HTMLElement;
    if (!cardContainer) return;

    // Get all card wrappers and cards to manipulate them
    const cardWrappers = cardContainer.querySelectorAll(':scope > div') as NodeListOf<HTMLElement>;
    const originalWrapperClasses: (string | null)[] = [];
    cardWrappers.forEach(wrapper => originalWrapperClasses.push(wrapper.getAttribute('class')));

    const cards = cardContainer.querySelectorAll('.glassmorphic') as NodeListOf<HTMLElement>;
    const originalCardStyles: string[] = [];
    cards.forEach(card => originalCardStyles.push(card.style.cssText));

    const originalElementStyles = {
      backgroundColor: element.style.backgroundColor,
      border: element.style.border,
      padding: element.style.padding,
    };

    // Apply temporary styles for PDF generation
    element.style.paddingTop = '2rem'; // Add padding to prevent header overlap
    element.style.backgroundColor = '#020617'; // Force dark background
    element.style.border = '2px solid #3b82f6';
    element.style.padding = '1rem'; // Use a bit more padding
    cardContainer.className = 'grid grid-cols-3 gap-4';

    // Temporarily override styles for PDF generation
    cardWrappers.forEach(wrapper => {
      wrapper.className = ''; // Remove all classes to avoid conflicts
    });
    cards.forEach(card => {
        card.style.height = 'auto'; // Allow card to grow with content
        card.style.overflow = 'hidden'; // Prevent content from spilling out
    });

    const originalTitle = document.title;
    document.title = `Profile - ${profile.first_name} ${profile.last_name}`;

    const opt = {
      margin:       0.1,
      filename:     `Profile-${profile.first_name}-${profile.last_name}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    // Temporarily hide the download button so it's not in the PDF
    const downloadButton = document.getElementById("download-pdf-button");
    if (downloadButton) {
      downloadButton.style.display = 'none';
    }

    html2pdf().from(element).set(opt).save().then(() => {
      // Restore button visibility, title, and original container styles
      if (downloadButton) {
        downloadButton.style.display = 'block';
      }
      document.title = originalTitle;
      element.style.backgroundColor = originalElementStyles.backgroundColor;
      element.style.border = originalElementStyles.border;
      element.style.padding = originalElementStyles.padding;
      cardContainer.className = originalContainerClasses;

      // Restore original classes and styles
      cardWrappers.forEach((wrapper, index) => {
        const originalClass = originalWrapperClasses[index];
        if (originalClass) {
          wrapper.setAttribute('class', originalClass);
        }
      });
      cards.forEach((card, index) => {
          card.style.cssText = originalCardStyles[index];
      });
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="bg-slate-950 min-h-screen">
          <Header />
          <ProfileSkeleton />
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-slate-950 min-h-screen">
          <Header />
          <div className="container mx-auto px-4 py-12 text-center">
            <Frown className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Could not load profile
            </h2>
            <p className="text-slate-400">{error}</p>
          </div>
        </div>
      );
    }

    if (!profile) {
      return (
        <div className="bg-slate-950 min-h-screen">
          <Header />
          <div className="container mx-auto px-4 py-12 text-center">
            <Frown className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Profile not found</h2>
            <p className="text-slate-400">
              The requested profile does not exist or has not been created yet.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div ref={profileContainerRef} className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="relative text-center mb-12 flex flex-col items-center">
          <div className="absolute top-0 right-0 z-10">
            <Button 
              id="download-pdf-button"
              onClick={handleDownloadPdf} 
              variant="outline" 
              className="glassmorphic-button"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
          <img
            src={`/api/routes/profiles/${profile.user_id}/picture`}
            alt={`${profile.first_name} ${profile.last_name}`}
            className="w-32 h-32 rounded-full object-cover border-4 border-purple-500 shadow-lg mb-4"
            onError={(e) => (e.currentTarget.src = "/placeholder-user.png")}
          />
          <h1 className="text-5xl font-bold">
            {profile.first_name} {profile.last_name}
          </h1>
          <p className="text-purple-300 mt-2 text-lg">
            {profile.elevator_pitch}
          </p>
        </div>

        {/* Swipable Card Layout */}
        <div id="pdf-card-container" className="flex snap-x snap-mandatory space-x-8 pb-8 overflow-x-auto custom-scrollbar">
          {/* Card 1: Bio & Contact */}
          <div className="snap-center flex-shrink-0 w-full md:w-1/2 lg:w-1/3">
            <Card className="glassmorphic h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2" /> About Me
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground break-words">{profile.bio}</p>
                <div className="space-y-2">
                  <h3 className="font-semibold">Contact</h3>
                  {profile.business_email && (
                    <a
                      href={`mailto:${profile.business_email}`}
                      className="flex items-center gap-2 hover:text-purple-400"
                    >
                      <Mail className="h-4 w-4" /> {profile.business_email}
                    </a>
                  )}
                  {profile.phone_number && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" /> {profile.phone_number}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Links</h3>
                  {profile.links?.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-purple-400"
                    >
                      {getIcon(link.url)} {link.link_type}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {profile.work_experiences && profile.work_experiences.length > 0 && (
            <div className="snap-center flex-shrink-0 w-full md:w-1/2 lg:w-1/3">
              <Card className="glassmorphic h-full">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="mr-2" /> Work Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.work_experiences.map((exp) => (
                    <div key={exp.id}>
                      <h3 className="font-bold">{exp.role}</h3>
                      <p className="text-purple-400">{exp.company_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {exp.start_date} - {exp.end_date || "Present"}
                      </p>
                      <p className="mt-1 break-words">{exp.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {profile.educations && profile.educations.length > 0 && (
            <div className="snap-center flex-shrink-0 w-full md:w-1/2 lg:w-1/3">
              <Card className="glassmorphic h-full">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="mr-2" /> Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.educations.map((edu) => (
                    <div key={edu.id}>
                      <h3 className="font-bold">{edu.institution_name}</h3>
                      <p className="text-purple-400">{edu.degree}</p>
                      <p className="text-sm text-muted-foreground">
                        {edu.field_of_study}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {edu.start_date} - {edu.end_date || "Present"}
                      </p>
                      {edu.description && <p className="mt-1 break-words">{edu.description}</p>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {profile.media && profile.media.length > 0 && (
            <div className="snap-center flex-shrink-0 w-full md:w-1/2 lg:w-1/3">
              <Card className="glassmorphic h-full">
                <CardHeader>
                  <CardTitle className="flex items-center"><Image className="mr-2" /> Media Gallery</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {profile.media.map((item) => (
                    <div key={item.id} className="relative group">
                      {item.media_type === 'image' ? (
                        <img src={item.url} alt={item.title || ''} className="rounded-lg object-cover w-full h-32" />
                      ) : (
                        <div className="w-full h-32 bg-black rounded-lg flex items-center justify-center">
                          <Video className="h-8 w-8 text-purple-400" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 p-2 rounded-b-lg w-full">
                        <h4 className="font-bold text-sm break-words">{item.title}</h4>
                        <p className="text-xs text-muted-foreground break-words">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {profile.code_snippets && profile.code_snippets.length > 0 && (
            <div className="snap-center flex-shrink-0 w-full md:w-2/3">
              <Card className="glassmorphic h-full">
                <CardHeader>
                  <CardTitle className="flex items-center"><Code className="mr-2" /> Code Snippets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.code_snippets.map((snippet) => (
                    <div key={snippet.id}>
                      <h3 className="font-bold text-purple-400 mb-2 break-words">{snippet.title}</h3>
                      <SyntaxHighlighter language={snippet.language?.toLowerCase() || 'javascript'} style={atomOneDark} customStyle={{background: "transparent", border: "1px solid #4A0E60", borderRadius: "0.5rem", wordBreak: 'break-all'}}>
                        {snippet.code}
                      </SyntaxHighlighter>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-slate-950 text-white flex flex-col">
      <Header />
      <main className="flex-grow overflow-y-auto custom-scrollbar">
        <div className="pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProfileDisplay;
