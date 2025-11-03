import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserGuardContext } from "app/auth";
import brain from "brain";
import { ProfileData, Link as LinkType, WorkExperience, Education, Media, CodeSnippet } from "types";
import { PlusCircle, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Header } from "components/Header";
import { useNavigate } from "react-router-dom";

const ProfileCompletion: React.FC = () => {
    const { user } = useUserGuardContext();
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<ProfileData>({
        first_name: '',
        last_name: '',
        bio: '',
        elevator_pitch: '',
        business_email: '',
        phone_number: '',
        links: [],
        work_experiences: [],
        educations: [],
        media: [],
        code_snippets: [],
    });
    const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await brain.get_my_profile();
                if (response.ok) {
                    const data = await response.json();
                    // Since the API might return null for optional fields, ensure we have a fallback
                    setFormData({
                        ...data,
                        links: data.links || [],
                        work_experiences: data.work_experiences || [],
                        educations: data.educations || [],
                        media: data.media || [],
                        code_snippets: data.code_snippets || [],
                    });
                }
            } catch (error) {
                console.error("Failed to fetch profile data", error);
                toast.error("Failed to load your existing profile data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLinkChange = (index: number, field: keyof LinkType, value: string) => {
        const newLinks = [...(formData.links || [])];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setFormData(prev => ({ ...prev, links: newLinks }));
    };

    const addLink = () => {
        setFormData(prev => ({ ...prev, links: [...(prev.links || []), { link_type: 'General', url: '' }] }));
    };

    const removeLink = (index: number) => {
        const newLinks = [...(formData.links || [])];
        newLinks.splice(index, 1);
        setFormData(prev => ({ ...prev, links: newLinks }));
    };

    const handleWorkExperienceChange = (index: number, field: keyof WorkExperience, value: string) => {
        const newWorkExperiences = [...(formData.work_experiences || [])];
        newWorkExperiences[index] = { ...newWorkExperiences[index], [field]: value };
        setFormData(prev => ({ ...prev, work_experiences: newWorkExperiences }));
    };

    const addWorkExperience = () => {
        setFormData(prev => ({ ...prev, work_experiences: [...(prev.work_experiences || []), { company_name: '', role: '', start_date: '', end_date: '', description: '' }] }));
    };

    const removeWorkExperience = (index: number) => {
        const newWorkExperiences = [...(formData.work_experiences || [])];
        newWorkExperiences.splice(index, 1);
        setFormData(prev => ({ ...prev, work_experiences: newWorkExperiences }));
    };

    const handleEducationChange = (index: number, field: keyof Education, value: string) => {
        const newEducations = [...(formData.educations || [])];
        newEducations[index] = { ...newEducations[index], [field]: value };
        setFormData(prev => ({ ...prev, educations: newEducations }));
    };

    const addEducation = () => {
        setFormData(prev => ({ ...prev, educations: [...(prev.educations || []), { institution_name: '', degree: '', field_of_study: '', start_date: '', end_date: '', description: '' }] }));
    };

    const removeEducation = (index: number) => {
        const newEducations = [...(formData.educations || [])];
        newEducations.splice(index, 1);
        setFormData(prev => ({ ...prev, educations: newEducations }));
    };

    const handleMediaChange = (index: number, field: keyof Media, value: string) => {
        const newMedia = [...(formData.media || [])];
        newMedia[index] = { ...newMedia[index], [field]: value };
        setFormData(prev => ({ ...prev, media: newMedia }));
    };

    const addMedia = () => {
        setFormData(prev => ({ ...prev, media: [...(prev.media || []), { media_type: 'image', url: '', title: '', description: '' }] }));
    };

    const removeMedia = (index: number) => {
        const newMedia = [...(formData.media || [])];
        newMedia.splice(index, 1);
        setFormData(prev => ({ ...prev, media: newMedia }));
    };

    const handleCodeSnippetChange = (index: number, field: keyof CodeSnippet, value: string) => {
        const newCodeSnippets = [...(formData.code_snippets || [])];
        newCodeSnippets[index] = { ...newCodeSnippets[index], [field]: value };
        setFormData(prev => ({ ...prev, code_snippets: newCodeSnippets }));
    };

    const addCodeSnippet = () => {
        setFormData(prev => ({ ...prev, code_snippets: [...(prev.code_snippets || []), { title: '', code: '', language: '' }] }));
    };

    const removeCodeSnippet = (index: number) => {
        const newCodeSnippets = [...(formData.code_snippets || [])];
        newCodeSnippets.splice(index, 1);
        setFormData(prev => ({ ...prev, code_snippets: newCodeSnippets }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const toastId = toast.loading("Saving profile...");
        try {
            // First, save the text data
            const profileResponse = await brain.create_or_update_profile(formData);
            await profileResponse.json();

            // Then, if there's a profile picture, upload it
            if (profilePictureFile) {
                await brain.upload_profile_picture({ file: profilePictureFile });
            }

            toast.success("Profile saved successfully!", { id: toastId });
            navigate('/profile-display'); // Redirect to the profile display page
        } catch (error) {
            console.error('Failed to save profile', error);
            toast.error("Failed to save profile. See console for details.", { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-8 pt-24 flex justify-center items-center">
                    <div className="text-center">
                        <p className="text-xl">Loading your profile...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 pt-24 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6 text-center text-white">
                        Complete Your Profile
                    </h1>
                    <form onSubmit={handleSubmit}>
                        <Card className="bg-gray-800 border-gray-700 shadow-md mb-6">
                            <CardHeader>
                                <CardTitle className="text-xl text-white">
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="first_name">First Name</Label>
                                        <Input
                                            id="first_name"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            className="bg-gray-700 border-gray-600 text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="last_name">Last Name</Label>
                                        <Input
                                            id="last_name"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            className="bg-gray-700 border-gray-600 text-white"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        className="bg-gray-700 border-gray-600 text-white"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="elevator_pitch">Elevator Pitch</Label>
                                    <Textarea
                                        id="elevator_pitch"
                                        name="elevator_pitch"
                                        value={formData.elevator_pitch}
                                        onChange={handleInputChange}
                                        placeholder="A short, compelling pitch about yourself."
                                        className="bg-gray-700 border-gray-600 text-white"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="profile_picture">Profile Picture</Label>
                                    <Input
                                        id="profile_picture"
                                        type="file"
                                        onChange={(e) =>
                                            setProfilePictureFile(e.target.files ? e.target.files[0] : null)
                                        }
                                        className="bg-gray-700 border-gray-600 file:text-purple-400 text-gray-300"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-800 border-gray-700 shadow-md mb-6">
                            <CardHeader>
                                <CardTitle className="text-xl text-white">
                                    Contact & Links
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="business_email">Business Email</Label>
                                        <Input
                                            id="business_email"
                                            name="business_email"
                                            type="email"
                                            value={formData.business_email}
                                            onChange={handleInputChange}
                                            className="bg-gray-700 border-gray-600 text-white"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone_number">Phone Number</Label>
                                        <Input
                                            id="phone_number"
                                            name="phone_number"
                                            value={formData.phone_number}
                                            onChange={handleInputChange}
                                            className="bg-gray-700 border-gray-600 text-white"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label>Links</Label>
                                    {formData.links?.map((link, index) => (
                                        <div key={index} className="flex items-center gap-2 mb-2">
                                            <Input
                                                placeholder="Link Type (e.g., GitHub)"
                                                value={link.link_type}
                                                onChange={(e) =>
                                                    handleLinkChange(index, "link_type", e.target.value)
                                                }
                                                className="bg-gray-700 border-gray-600 text-white"
                                            />
                                            <Input
                                                placeholder="URL"
                                                value={link.url}
                                                onChange={(e) =>
                                                    handleLinkChange(index, "url", e.target.value)
                                                }
                                                className="bg-gray-700 border-gray-600 text-white"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeLink(index)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addLink}
                                        className="text-purple-400 border-purple-400 hover:bg-purple-900/20 hover:text-purple-300"
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Link
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-800 border-gray-700 shadow-md mb-6">
                            <CardHeader>
                                <CardTitle className="text-xl text-white">Work Experience</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {formData.work_experiences?.map((exp, index) => (
                                    <div
                                        key={index}
                                        className="space-y-3 border border-gray-700 bg-gray-800 p-4 rounded-md mb-4 relative"
                                    >
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2"
                                            onClick={() => removeWorkExperience(index)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <Input
                                                placeholder="Company Name"
                                                value={exp.company_name}
                                                onChange={(e) =>
                                                    handleWorkExperienceChange(index, "company_name", e.target.value)
                                                }
                                                className="bg-gray-700 border-gray-600"
                                            />
                                            <Input
                                                placeholder="Role"
                                                value={exp.role}
                                                onChange={(e) =>
                                                    handleWorkExperienceChange(index, "role", e.target.value)
                                                }
                                                className="bg-gray-700 border-gray-600"
                                            />
                                            <Input
                                                type="date"
                                                placeholder="Start Date"
                                                value={exp.start_date}
                                                onChange={(e) =>
                                                    handleWorkExperienceChange(index, "start_date", e.target.value)
                                                }
                                                className="bg-gray-700 border-gray-600"
                                                required
                                            />
                                            <Input
                                                type="date"
                                                placeholder="End Date"
                                                value={exp.end_date || ''}
                                                onChange={(e) =>
                                                    handleWorkExperienceChange(index, "end_date", e.target.value)
                                                }
                                                className="bg-gray-700 border-gray-600"
                                            />
                                        </div>
                                        <Textarea
                                            placeholder="Description"
                                            value={exp.description}
                                            onChange={(e) =>
                                                handleWorkExperienceChange(index, "description", e.target.value)
                                            }
                                            className="bg-gray-700 border-gray-600"
                                        />
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addWorkExperience}
                                    className="text-purple-400 border-purple-400 hover:bg-purple-900/20 hover:text-purple-300"
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Work Experience
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-800 border-gray-700 shadow-md mb-6">
                            <CardHeader>
                                <CardTitle className="text-xl text-white">Education</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {formData.educations?.map((edu, index) => (
                                    <div
                                        key={index}
                                        className="space-y-3 border border-gray-700 bg-gray-800 p-4 rounded-md mb-4 relative"
                                    >
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2"
                                            onClick={() => removeEducation(index)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <Input
                                                placeholder="Institution Name"
                                                value={edu.institution_name}
                                                onChange={(e) =>
                                                    handleEducationChange(index, "institution_name", e.target.value)
                                                }
                                                className="bg-gray-700 border-gray-600"
                                            />
                                            <Input
                                                placeholder="Degree"
                                                value={edu.degree}
                                                onChange={(e) =>
                                                    handleEducationChange(index, "degree", e.target.value)
                                                }
                                                className="bg-gray-700 border-gray-600"
                                            />
                                            <Input
                                                placeholder="Field of Study"
                                                value={edu.field_of_study}
                                                onChange={(e) =>
                                                    handleEducationChange(index, "field_of_study", e.target.value)
                                                }
                                                className="bg-gray-700 border-gray-600"
                                            />
                                            <Input
                                                type="date"
                                                placeholder="Start Date"
                                                value={edu.start_date}
                                                onChange={(e) =>
                                                    handleEducationChange(index, "start_date", e.target.value)
                                                }
                                                className="bg-gray-700 border-gray-600"
                                                required
                                            />
                                            <Input
                                                type="date"
                                                placeholder="End Date"
                                                value={edu.end_date || ''}
                                                onChange={(e) =>
                                                    handleEducationChange(index, "end_date", e.target.value)
                                                }
                                                className="bg-gray-700 border-gray-600"
                                            />
                                        </div>
                                        <Textarea
                                            placeholder="Description"
                                            value={edu.description}
                                            onChange={(e) =>
                                                handleEducationChange(index, "description", e.target.value)
                                            }
                                            className="bg-gray-700 border-gray-600"
                                        />
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addEducation}
                                    className="text-purple-400 border-purple-400 hover:bg-purple-900/20 hover:text-purple-300"
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Education
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-800 border-gray-700 shadow-md mb-6">
                            <CardHeader>
                                <CardTitle className="text-xl text-white">Media Gallery</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {formData.media?.map((item, index) => (
                                    <div
                                        key={index}
                                        className="space-y-3 border border-gray-700 bg-gray-800 p-4 rounded-md mb-4 relative"
                                    >
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2"
                                            onClick={() => removeMedia(index)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                        <Input
                                            placeholder="Title"
                                            value={item.title}
                                            onChange={(e) =>
                                                handleMediaChange(index, "title", e.target.value)
                                            }
                                            className="bg-gray-700 border-gray-600"
                                        />
                                        <Input
                                            placeholder="URL (for video or external image)"
                                            value={item.url}
                                            onChange={(e) =>
                                                handleMediaChange(index, "url", e.target.value)
                                            }
                                            className="bg-gray-700 border-gray-600"
                                        />
                                        <Textarea
                                            placeholder="Description"
                                            value={item.description}
                                            onChange={(e) =>
                                                handleMediaChange(index, "description", e.target.value)
                                            }
                                            className="bg-gray-700 border-gray-600"
                                        />
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addMedia}
                                    className="text-purple-400 border-purple-400 hover:bg-purple-900/20 hover:text-purple-300"
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Media
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-800 border-gray-700 shadow-md mb-6">
                            <CardHeader>
                                <CardTitle className="text-xl text-white">Code Snippets</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {formData.code_snippets?.map((snippet, index) => (
                                    <div
                                        key={index}
                                        className="space-y-3 border border-gray-700 bg-gray-800 p-4 rounded-md mb-4 relative"
                                    >
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2"
                                            onClick={() => removeCodeSnippet(index)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                        <Input
                                            placeholder="Title"
                                            value={snippet.title}
                                            onChange={(e) =>
                                                handleCodeSnippetChange(index, "title", e.target.value)
                                            }
                                            className="bg-gray-700 border-gray-600"
                                        />
                                        <Input
                                            placeholder="Language (e.g., JavaScript)"
                                            value={snippet.language}
                                            onChange={(e) =>
                                                handleCodeSnippetChange(index, "language", e.target.value)
                                            }
                                            className="bg-gray-700 border-gray-600"
                                        />
                                        <Textarea
                                            placeholder="Code"
                                            value={snippet.code}
                                            onChange={(e) =>
                                                handleCodeSnippetChange(index, "code", e.target.value)
                                            }
                                            rows={6}
                                            className="bg-gray-700 border-gray-600 font-mono"
                                        />
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addCodeSnippet}
                                    className="text-purple-400 border-purple-400 hover:bg-purple-900/20 hover:text-purple-300"
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Code Snippet
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="text-center">
                            <Button
                                type="submit"
                                size="lg"
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                disabled={isSaving}
                            >
                                {isSaving ? "Saving..." : "Save Profile"}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default ProfileCompletion;
