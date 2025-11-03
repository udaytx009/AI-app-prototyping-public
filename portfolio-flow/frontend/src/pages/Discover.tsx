import brain from "brain";
import { useEffect, useState } from "react";
import { PublicProfile } from "types";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Header } from "components/Header";

export default function Discover() {
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const response = await brain.list_public_profiles({});
        if (response.ok) {
          const data = await response.json();
          setProfiles(data);
        } else {
          setError("Failed to fetch profiles. Please try again later.");
        }
      } catch (err) {
        setError("An error occurred while fetching profiles.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <p>Loading profiles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="p-4 sm:p-6 md:p-8 pt-24">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center text-purple-400">Discover Creators</h1>
          {profiles.length === 0 ? (
            <p className="text-center text-gray-400">No public profiles found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {profiles.map((profile) => (
                <Card
                  key={profile.user_id}
                  className="glassmorphic overflow-hidden transform transition-transform hover:scale-105"
                >
                  <Link to={`/profiledisplay?userId=${profile.user_id}`}>
                    <div className="relative h-48">
                      <CardHeader className="flex flex-col items-center text-center p-6">
                        <Avatar className="w-24 h-24 mb-4 border-2 border-purple-400">
                          <AvatarImage src={profile.profile_picture_url || ""} alt={`${profile.first_name} ${profile.last_name}`} />
                          <AvatarFallback>{`${profile.first_name?.[0] || '?'}${profile.last_name?.[0] || '?'}`}</AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-xl font-bold">{`${profile.first_name} ${profile.last_name}`}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 pt-0 text-center">
                        <p className="text-sm text-purple-300 italic mb-4 h-12 overflow-hidden text-ellipsis">
                          "{profile.elevator_pitch}"
                        </p>
                        <p className="text-sm text-gray-300 h-16 overflow-hidden text-ellipsis">
                          {profile.bio}
                        </p>
                      </CardContent>
                      <CardFooter className="p-6 pt-0">
                        <Button variant="outline" className="w-full bg-purple-600 hover:bg-purple-700 border-purple-500">
                          View Profile
                        </Button>
                      </CardFooter>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
