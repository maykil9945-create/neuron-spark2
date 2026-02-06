import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import axios from "axios";
import { API } from "@/App";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

export default function ProgramCreation() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    study_field: "",
    exam_goal: "",
    daily_hours: "",
    study_days: 5
  });
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    // Validation
    if (step === 1 && !formData.name.trim()) {
      alert("Lütfen adını gir");
      return;
    }
    if (step === 2 && !formData.exam_goal) {
      alert("Lütfen sınav hedefini seç");
      return;
    }
    if (step === 3 && !formData.daily_hours) {
      alert("Lütfen günlük çalışma süresini seç");
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      
      // Create profile with userId
      const profileRes = await axios.post(`${API}/profiles`, {
        name: formData.name,
        study_field: formData.study_field || null
      });
      
      const profileId = profileRes.data.id;

      // Create program
      await axios.post(`${API}/programs`, {
        profile_id: profileId,
        exam_goal: formData.exam_goal,
        daily_hours: formData.daily_hours,
        study_days: formData.study_days
      });

      // Store profile ID and name
      localStorage.setItem("profileId", profileId);
      localStorage.setItem("userName", formData.name);
      
      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating program:", error);
      alert("Bir hata oluştu. Lütfen tekrar dene.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl" data-testid="program-creation-card">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {step === 1 && "Kendini Tanıt"}
            {step === 2 && "Sınav Hedefin"}
            {step === 3 && "Çalışma Programın"}
          </CardTitle>
          <div className="flex justify-center gap-2 mt-4">
            <div className={`h-2 w-20 rounded ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            <div className={`h-2 w-20 rounded ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            <div className={`h-2 w-20 rounded ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Profile */}
          {step === 1 && (
            <div className="space-y-4" data-testid="step-profile">
              <div>
                <Label htmlFor="name">Adın *</Label>
                <Input
                  id="name"
                  placeholder="Örn: Ahmet"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-name"
                />
              </div>

              <div>
                <Label>Alan (Opsiyonel)</Label>
                <RadioGroup value={formData.study_field} onValueChange={(val) => setFormData({ ...formData, study_field: val })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sayısal" id="sayisal" data-testid="radio-sayisal" />
                    <Label htmlFor="sayisal" className="cursor-pointer">Sayısal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="EA" id="ea" data-testid="radio-ea" />
                    <Label htmlFor="ea" className="cursor-pointer">Eşit Ağırlık</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Sözel" id="sozel" data-testid="radio-sozel" />
                    <Label htmlFor="sozel" className="cursor-pointer">Sözel</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 2: Exam Goal */}
          {step === 2 && (
            <div className="space-y-4" data-testid="step-exam-goal">
              <Label>Sınav Hedefin *</Label>
              <RadioGroup value={formData.exam_goal} onValueChange={(val) => setFormData({ ...formData, exam_goal: val })}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="TYT" id="tyt" data-testid="radio-tyt" />
                  <Label htmlFor="tyt" className="cursor-pointer">TYT</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="AYT" id="ayt" data-testid="radio-ayt" />
                  <Label htmlFor="ayt" className="cursor-pointer">AYT</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="TYT + AYT" id="both" data-testid="radio-both" />
                  <Label htmlFor="both" className="cursor-pointer">TYT + AYT</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 3: Study Schedule */}
          {step === 3 && (
            <div className="space-y-6" data-testid="step-study-schedule">
              <div>
                <Label>Günlük Çalışma Süresi *</Label>
                <RadioGroup value={formData.daily_hours} onValueChange={(val) => setFormData({ ...formData, daily_hours: val })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1-2" id="hours-1-2" data-testid="radio-hours-1-2" />
                    <Label htmlFor="hours-1-2" className="cursor-pointer">1-2 saat</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2-4" id="hours-2-4" data-testid="radio-hours-2-4" />
                    <Label htmlFor="hours-2-4" className="cursor-pointer">2-4 saat</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4+" id="hours-4plus" data-testid="radio-hours-4plus" />
                    <Label htmlFor="hours-4plus" className="cursor-pointer">4+ saat</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="study-days">Haftada Kaç Gün Çalışacaksın?</Label>
                <Input
                  id="study-days"
                  type="number"
                  min="1"
                  max="7"
                  value={formData.study_days}
                  onChange={(e) => setFormData({ ...formData, study_days: parseInt(e.target.value) || 1 })}
                  data-testid="input-study-days"
                />
                <p className="text-sm text-gray-500 mt-1">1-7 gün arası</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => step === 1 ? navigate("/") : setStep(step - 1)}
              data-testid="btn-back"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>

            <Button
              onClick={handleNext}
              disabled={loading}
              data-testid="btn-next"
            >
              {loading ? "Oluşturuluyor..." : step === 3 ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Tamamla
                </>
              ) : (
                <>
                  İleri
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
