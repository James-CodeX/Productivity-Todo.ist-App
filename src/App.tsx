import { Suspense, useEffect, useState } from "react";
import { useRoutes, Routes, Route, Link, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import { AuthModal } from "./components/auth/AuthModal";
import { Button } from "./components/ui/button";
import { User } from "@supabase/supabase-js";
import Home from "./components/home";
import CompletedTasks from "./components/CompletedTasks";
import routes from "tempo-routes";
import { Container } from "./components/ui/container";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <div className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Container>
            <div className="flex h-14 items-center justify-between">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  todo.ist
                </span>
              </Link>
              <div className="flex items-center space-x-4">
                {user ? (
                  <Button
                    variant="outline"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      navigate("/");
                    }}
                  >
                    Sign Out
                  </Button>
                ) : (
                  <Button onClick={() => setIsAuthModalOpen(true)}>
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </Container>
        </header>
        <Container className="py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/completed" element={<CompletedTasks />} />
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </Container>
      </div>
      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </Suspense>
  );
}

export default App;
