import React from "react";
import { Button } from "./ui/button";
import {
  Waves,
  Users,
  Wrench,
  Clock,
  AlertCircle,
} from "lucide-react";
import logoImage from "../assets/laundryline.png";

interface HomePageProps {
  onNavigate: (page: "login" | "signup") => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-2">
            <img
              src={logoImage}
              alt="LaundryLine Logo"
              className="h-35 w-auto"
            />
          </div>
          <h1 className="text-[var(--text)] mb-4">
            Welcome to LaundryLine
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The smart dorm laundry management platform that
            keeps your laundry routine simple and efficient
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => onNavigate("login")}
              className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--text)] px-8 py-6 text-lg"
            >
              Log In
            </Button>
            <Button
              onClick={() => onNavigate("signup")}
              variant="outline"
              className="border-2 border-[var(--primary)] text-[var(--text)] hover:bg-[var(--primary)]/10 px-8 py-6 text-lg"
            >
              Sign Up
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <div className="bg-white p-6 rounded-xl shadow-md border-2 border-[var(--primary)] text-center">
            <div className="w-12 h-12 bg-[var(--primary)]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-[var(--primary)]" />
            </div>
            <h3 className="text-[var(--text)] mb-2">
              Real-Time Status
            </h3>
            <p className="text-sm text-gray-600">
              Check machine availability instantly and plan your
              laundry time
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-2 border-[var(--secondary)] text-center">
            <div className="w-12 h-12 bg-[var(--secondary)]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-[var(--secondary)]" />
            </div>
            <h3 className="text-[var(--text)] mb-2">
              Digital Queue
            </h3>
            <p className="text-sm text-gray-600">
              Join queues digitally and never miss your turn
              again
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-2 border-[var(--accent)] text-center">
            <div className="w-12 h-12 bg-[var(--accent)]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <h3 className="text-[var(--text)] mb-2">
              Issue Reporting
            </h3>
            <p className="text-sm text-gray-600">
              Report machine problems quickly and track repair
              status
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-2 border-[var(--primary)] text-center">
            <div className="w-12 h-12 bg-[var(--primary)]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-6 h-6 text-[var(--primary)]" />
            </div>
            <h3 className="text-[var(--text)] mb-2">
              Management Tools
            </h3>
            <p className="text-sm text-gray-600">
              Powerful tools for dorm managers to track and
              maintain machines
            </p>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-20 bg-white rounded-2xl shadow-xl p-8 sm:p-12 border-2 border-[var(--primary)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-[var(--text)] mb-4">
                For Students
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--primary)] mt-1">
                    ✓
                  </span>
                  <span>
                    View all available laundry machines in
                    real-time
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--primary)] mt-1">
                    ✓
                  </span>
                  <span>
                    Join time-based queues for specific machines
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--primary)] mt-1">
                    ✓
                  </span>
                  <span>
                    See live queue positions with student IDs
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--primary)] mt-1">
                    ✓
                  </span>
                  <span>
                    Report machine issues with detailed
                    descriptions
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-[var(--text)] mb-4">
                For Dorm Managers
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[var(--secondary)] mt-1">
                    ✓
                  </span>
                  <span>
                    Add, edit, and remove laundry machines
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--secondary)] mt-1">
                    ✓
                  </span>
                  <span>
                    Track all submitted issue reports with
                    machine details
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--secondary)] mt-1">
                    ✓
                  </span>
                  <span>
                    Update machine operational status instantly
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[var(--secondary)] mt-1">
                    ✓
                  </span>
                  <span>
                    Manage machine availability and maintenance
                    schedules
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}