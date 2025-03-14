"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Menu, Search, X } from "lucide-react"

export function DashboardHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold mr-8">
            Flinsight
          </Link>

          <nav className="hidden md:flex space-x-6">
            <Link href="/dashboard" className="text-white hover:text-blue-400 transition-colors">
              Dashboard
            </Link>
            {/* <Link href="/flights" className="text-slate-300 hover:text-blue-400 transition-colors">
              Flights
            </Link>
            <Link href="/regulations" className="text-slate-300 hover:text-blue-400 transition-colors">
              Regulations
            </Link>
            <Link href="/reports" className="text-slate-300 hover:text-blue-400 transition-colors">
              Reports
            </Link> */}
          </nav>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {/* <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search regulations..." className="pl-9 bg-slate-800 border-slate-700" />
          </div> */}

          <Button variant="ghost" size="icon" className="text-slate-300">
            <Bell className="h-5 w-5" />
          </Button>

          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
            TQ
          </div>
        </div>

        <button className="md:hidden text-slate-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search regulations..." className="pl-9 bg-slate-800 border-slate-700 w-full" />
            </div>

            <nav className="flex flex-col space-y-3">
              <Link
                href="/dashboard"
                className="text-white py-2 px-3 rounded-md bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/flights"
                className="text-slate-300 py-2 px-3 rounded-md hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Flights
              </Link>
              <Link
                href="/regulations"
                className="text-slate-300 py-2 px-3 rounded-md hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Regulations
              </Link>
              <Link
                href="/reports"
                className="text-slate-300 py-2 px-3 rounded-md hover:bg-slate-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Reports
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

