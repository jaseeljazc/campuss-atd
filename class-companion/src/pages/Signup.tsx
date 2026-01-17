import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'teacher' | 'student',
    department: '',
    semester: 1,
    assignedSemesters: [] as number[],
    assignedPeriods: [] as number[],
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const { apiService } = await import('@/services/api');
      const result = await apiService.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department,
        semester: formData.role === 'student' ? formData.semester : undefined,
        assignedSemesters: formData.role === 'teacher' ? formData.assignedSemesters : undefined,
        assignedPeriods: formData.role === 'teacher' ? formData.assignedPeriods : undefined,
      });

      // Auto-login after signup
      await login(formData.email, formData.password);
      toast.success('Account created successfully!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Signup failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil'];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
  const periods = [1, 2, 3, 4, 5];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--present)/0.1),transparent_50%)]" />

      <Card className="w-full max-w-2xl relative z-10 shadow-elevated">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-display">Create Account</CardTitle>
            <CardDescription className="text-base mt-2">
              Sign up as a student or teacher
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'teacher' | 'student') =>
                    setFormData({ ...formData, role: value })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                  disabled={isLoading}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.role === 'student' && (
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={formData.semester.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, semester: parseInt(value) })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.role === 'teacher' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Assigned Semesters (comma-separated)</Label>
                  <Input
                    placeholder="e.g., 1,2,3"
                    value={formData.assignedSemesters.join(',')}
                    onChange={(e) => {
                      const values = e.target.value
                        .split(',')
                        .map((v) => parseInt(v.trim()))
                        .filter((v) => !isNaN(v) && v >= 1 && v <= 8);
                      setFormData({ ...formData, assignedSemesters: values });
                    }}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Assigned Periods (comma-separated)</Label>
                  <Input
                    placeholder="e.g., 1,2,3"
                    value={formData.assignedPeriods.join(',')}
                    onChange={(e) => {
                      const values = e.target.value
                        .split(',')
                        .map((v) => parseInt(v.trim()))
                        .filter((v) => !isNaN(v) && v >= 1 && v <= 5);
                      setFormData({ ...formData, assignedPeriods: values });
                    }}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Signup;
