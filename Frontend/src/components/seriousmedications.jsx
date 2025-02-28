"use client"

import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { Search, AlertOctagon, Globe, Shield, HeartPulse, Plus } from "lucide-react"
import { Navbar } from "./Navbar"
import { AddMedicationForm } from "./addmedicationform"
import { MedicationCard } from "./medicationcard"
import axios from "axios"

const server_url = import.meta.env.VITE_SERVER_URL;

// Organization definitions
const ORGANIZATIONS = [
  {
    name: "WHO",
    icon: <Globe className="w-5 h-5" />,
    description: "World Health Organization",
  },
  {
    name: "FDA",
    icon: <Shield className="w-5 h-5" />,
    description: "Food and Drug Administration",
  },
  {
    name: "ICMR",
    icon: <HeartPulse className="w-5 h-5" />,
    description: "Indian Council of Medical Research",
  },
]

export function SeriousMedications() {
  const [darkMode, setDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedOrganization, setSelectedOrganization] = useState("all")
  const [sortBy, setSortBy] = useState("badEffectScore")
  const [showAddForm, setShowAddForm] = useState(false)
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch medications from the API
  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const response = await axios.get(`${server_url}api/medications`);
        setMedications(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching medications:", err);
        setError("Error fetching medications. Please try again later.");
        setLoading(false);
      }
    };

    fetchMedications();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  // Get unique categories from actual data
  const categories = Array.from(new Set(medications.map((med) => med.category)))

  // Get unique organizations from actual data
  const organizations = Array.from(
    new Set(medications.flatMap((med) => med.organizations.map(org => org.organization)))
  )

  // Filter and sort medications
  const filteredMedications = medications
    .filter((med) => {
      const matchesSearch =
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || med.category === selectedCategory
      const matchesOrganization = selectedOrganization === "all" || 
        med.organizations.some(org => org.organization === selectedOrganization)
      return matchesSearch && matchesCategory && matchesOrganization
    })
    .sort((a, b) => b[sortBy] - a[sortBy])

  const handleAddMedication = (newMedication) => {
    setMedications((prev) => [newMedication, ...prev])
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      {/* Add Medication Form */}
      <AnimatePresence>
        {showAddForm && <AddMedicationForm onClose={() => setShowAddForm(false)} onSubmit={handleAddMedication} />}
      </AnimatePresence>

      <div className="bg-white dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Add Medication Button */}
          <button
            onClick={() => setShowAddForm(true)}
            className="fixed bottom-6 right-6 bg-blue-600 dark:bg-blue-500 text-white p-4 rounded-full shadow-lg z-40 transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-red-600 dark:text-red-500 flex items-center gap-2">
              <AlertOctagon className="w-10 h-10" />
              Serious Medications Watch
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
              Comprehensive tracking of medications flagged for serious health concerns by major health organizations
              worldwide. This information is crucial for healthcare providers and patients.
            </p>
          </div>

          {/* Organizations Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {ORGANIZATIONS.map((org) => (
              <div key={org.name} className="relative overflow-hidden border rounded-lg shadow-sm dark:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    {org.icon}
                    <h2 className="text-lg font-semibold">{org.name}</h2>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{org.description}</p>
                  <div className="mt-4">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-500">
                      {medications.filter((med) => 
                        med.organizations && med.organizations.some(o => o.organization === org.name)
                      ).length}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Flagged Medications</p>
                  </div>
                </div>
                <div
                  className={`absolute top-0 right-0 w-2 h-full ${
                    org.name === "WHO" ? "bg-blue-500" : org.name === "FDA" ? "bg-green-500" : "bg-purple-500"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mt-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search medications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
            </div>
            <div className="relative">
              <select
                value={selectedOrganization}
                onChange={(e) => setSelectedOrganization(e.target.value)}
                className="w-[200px] px-4 py-2 border rounded-lg appearance-none dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="all">All Organizations</option>
                {organizations.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-[200px] px-4 py-2 border rounded-lg appearance-none dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Medications List */}
          <div className="grid grid-cols-1 gap-6 mt-8">
            <AnimatePresence>
              {filteredMedications.map((medication) => (
                <MedicationCard key={medication._id || medication.id} medication={medication} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}