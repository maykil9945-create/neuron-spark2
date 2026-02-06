import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Users } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-indigo-900 mb-2" data-testid="app-logo">
          Neuron Spark
        </h1>
        <div className="w-20 h-1 bg-indigo-600 mx-auto"></div>
      </div>

      {/* Hero Section */}
      <div className="text-center max-w-3xl mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" data-testid="landing-title">
          Program yapmak zor değil. Kolaylaştırılmış sistemle hemen başla.
        </h2>
        <p className="text-xl md:text-2xl text-gray-700 mb-8" data-testid="landing-subtitle">
          Bugün ne çalışacağını düşünme. Biz senin için sadeleştirdik.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="w-full sm:w-auto text-lg px-8 py-6 bg-indigo-600 hover:bg-indigo-700"
            onClick={() => navigate("/program/create")}
            data-testid="create-program-btn"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            Programı Oluştur
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto text-lg px-8 py-6 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
            onClick={() => navigate("/rooms")}
            data-testid="join-rooms-btn"
          >
            <Users className="mr-2 h-5 w-5" />
            Online Odalara Katıl
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mt-12">
        <div className="text-center p-6 bg-white rounded-lg shadow-md" data-testid="feature-card-program">
          <div className="text-4xl mb-3">📚</div>
          <h3 className="font-semibold text-lg mb-2">Kişisel Program</h3>
          <p className="text-gray-600">Hedefine özel çalışma programı oluştur</p>
        </div>

        <div className="text-center p-6 bg-white rounded-lg shadow-md" data-testid="feature-card-rooms">
          <div className="text-4xl mb-3">👥</div>
          <h3 className="font-semibold text-lg mb-2">Online Odalar</h3>
          <p className="text-gray-600">Arkadaşlarınla birlikte çalış</p>
        </div>

        <div className="text-center p-6 bg-white rounded-lg shadow-md" data-testid="feature-card-track">
          <div className="text-4xl mb-3">⏱️</div>
          <h3 className="font-semibold text-lg mb-2">İlerleme Takibi</h3>
          <p className="text-gray-600">Günlük hedeflerini tamamla</p>
        </div>
      </div>
    </div>
  );
}
