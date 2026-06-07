import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const setSession = useAuthStore((state) => state.setSession);

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);

      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;
      if (!loginData.user) throw new Error("Login failed");

      // ambil session
      setSession(loginData.session);

      // cek company_users
      const { data: companyUser, error: companyError } = await supabase
        .from("company_users")
        .select(
          `
            *,
            companies(*),
            roles:role_id(name, code)
          `,
        )
        .eq("user_id", loginData.user.id)
        .single();

      if (companyError || !companyUser) throw new Error("User belum terhubung ke perusahaan");

      setUser(companyUser);

      // redirect ke dashboard
      navigate("/");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-6 border rounded">
      <h2 className="text-2xl mb-4">Login PT ENNA</h2>
      <input type="email" placeholder="Email" className="w-full mb-2 p-2 border rounded" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" className="w-full mb-2 p-2 border rounded" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="w-full bg-blue-600 text-white p-2 rounded" disabled={loading} onClick={handleLogin}>
        {loading ? "Loading..." : "Login"}
      </button>
    </div>
  );
}
