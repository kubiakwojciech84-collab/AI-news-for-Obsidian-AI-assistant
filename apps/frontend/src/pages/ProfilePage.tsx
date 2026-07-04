import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { PublicUser } from "@nova/shared";
import { UsersApi } from "../api/endpoints";
import { useAuth } from "../auth/AuthContext";

export function ProfilePage() {
  const { username } = useParams();
  const { user: me, refreshUser } = useAuth();
  const isOwnProfile = !username;
  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = isOwnProfile ? UsersApi.me() : UsersApi.byUsername(username!);
    load.then((p) => {
      setProfile(p);
      setDisplayName(p.displayName);
      setBio(p.bio);
    });
  }, [username, isOwnProfile]);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await UsersApi.updateProfile({ displayName, bio } as any);
      setProfile(updated);
      await refreshUser();
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <main className="page">Ladowanie profilu...</main>;

  return (
    <main className="page">
      <h1>{profile.displayName || profile.username}</h1>
      <p style={{ color: "var(--text-muted)" }}>@{profile.username} - Poziom {profile.level} - {profile.xp} XP</p>
      <p>{profile.bio || "Brak opisu."}</p>
      <p>Monety: {profile.coins}</p>

      {isOwnProfile && me?.id === profile.id && (
        <form className="stack card" onSubmit={onSave} style={{ marginTop: "1rem" }}>
          <label>
            Wyswietlana nazwa
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={30} />
          </label>
          <label>
            Bio
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={300} rows={3} />
          </label>
          <button className="btn" type="submit" disabled={saving}>
            {saving ? "Zapisywanie..." : "Zapisz profil"}
          </button>
        </form>
      )}
    </main>
  );
}
