
import { useEffect, useState } from "react";
import "./Profile.css";

const API = "http://localhost:8080/api/profile";

function Profile({ token, onBack }) {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    preferredTransport: "",
    dietPreference: "",
    energySource: "",
    sustainabilityGoal: ""
  });

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Unable to load profile");
        return res.json();
      })
      .then(data => setProfile({
        name: data.name || "",
        email: data.email || "",
        age: data.age || "",
        gender: data.gender || "",
        preferredTransport: data.preferredTransport || "",
        dietPreference: data.dietPreference || "",
        energySource: data.energySource || "",
        sustainabilityGoal: data.sustainabilityGoal || ""
      }))
      .catch(err => setMessage(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleChange = e => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const saveProfile = async e => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(API, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...profile,
          age: profile.age === "" ? null : Number(profile.age)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Profile update failed");

      setMessage("Profile updated successfully!");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const changePassword = async e => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${API}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(password)
      });

      const data = await res.text();
      if (!res.ok) throw new Error(data);

      setMessage(data);
      setPassword({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setMessage(err.message);
    }
  };

  if (loading) return <div className="profile-page">Loading profile...</div>;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="back-btn" onClick={onBack}>← Dashboard</button>
        <div>
          <p className="profile-tag">ACCOUNT SETTINGS</p>
          <h1>My Profile</h1>
          <p>Manage your personal details and sustainability preferences.</p>
        </div>
      </div>

      {message && <div className="profile-message">{message}</div>}

      <form className="profile-card" onSubmit={saveProfile}>
        <h2>Personal Information</h2>

        <div className="profile-grid">
          <label>
            Full Name
            <input name="name" value={profile.name}
              onChange={handleChange} required />
          </label>

          <label>
            Email Address
            <input value={profile.email} disabled />
          </label>

          <label>
            Age
            <input type="number" name="age" value={profile.age}
              onChange={handleChange} min="1" />
          </label>

          <label>
            Gender
            <select name="gender" value={profile.gender}
              onChange={handleChange}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </label>
        </div>

        <h2>Sustainability Preferences</h2>

        <div className="profile-grid">
          <label>
            Preferred Transport
            <select name="preferredTransport"
              value={profile.preferredTransport} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Public Transport">Public Transport</option>
              <option value="Bicycle">Bicycle</option>
              <option value="Walking">Walking</option>
              <option value="Car">Car</option>
              <option value="Electric Vehicle">Electric Vehicle</option>
            </select>
          </label>

          <label>
            Diet Preference
            <select name="dietPreference"
              value={profile.dietPreference} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
            </select>
          </label>

          <label>
            Energy Source
            <select name="energySource"
              value={profile.energySource} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Renewable">Renewable</option>
              <option value="Grid Electricity">Grid Electricity</option>
              <option value="Solar">Solar</option>
            </select>
          </label>

          <label>
            Sustainability Goal
            <input name="sustainabilityGoal"
              value={profile.sustainabilityGoal}
              onChange={handleChange}
              placeholder="e.g. Reduce emissions by 20%" />
          </label>
        </div>

        <button className="save-btn" type="submit">Save Changes</button>
      </form>

      <form className="profile-card password-card" onSubmit={changePassword}>
        <h2>Change Password</h2>
        <p>Enter your current password and choose a new one.</p>

        <div className="profile-grid">
          <label>
            Current Password
            <input type="password" required
              value={password.currentPassword}
              onChange={e => setPassword({
                ...password, currentPassword: e.target.value
              })} />
          </label>

          <label>
            New Password
            <input type="password" required minLength="6"
              value={password.newPassword}
              onChange={e => setPassword({
                ...password, newPassword: e.target.value
              })} />
          </label>
        </div>

        <button className="save-btn" type="submit">
          Update Password
        </button>
      </form>
    </div>
  );
}

export default Profile;
