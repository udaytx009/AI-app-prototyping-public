import { PublicProfile } from "types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface Props {
  profile: PublicProfile;
}

export const ProfileCard: React.FC<Props> = ({ profile }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/profile-display?userId=${profile.user_id}`);
  };

  return (
    <Card className="glassmorphic-card overflow-hidden group">
      <CardContent className="p-6 text-center">
        <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-transparent group-hover:border-purple-500 transition-all">
          <AvatarImage src={profile.user_id ? `/api/routes/profiles/${profile.user_id}/picture` : ""} alt={`${profile.first_name} ${profile.last_name}`} />
          <AvatarFallback>
            <User className="w-12 h-12 text-slate-400" />
          </AvatarFallback>
        </Avatar>
        <h3 className="text-xl font-bold text-white mb-1">
          {profile.first_name} {profile.last_name}
        </h3>
        <p className="text-slate-400 text-sm h-16 overflow-hidden">
          {profile.bio || profile.elevator_pitch}
        </p>
        <Button onClick={handleViewProfile} variant="outline" className="mt-4 futuristic-button">
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
};
