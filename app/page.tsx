import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowRight, Plane, Shield, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative w-full h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/90"></div>
          <div className="h-full w-full">
            <Image
              src="/placeholder.svg?height=1080&width=1920"
              alt="Aviation background"
              className="object-cover opacity-20"
              fill
              priority
            />
          </div>
          <div className="absolute inset-0  bg-cover bg-center opacity-30"
           style={{ backgroundImage: "url('/gulf.jpeg')" }}></div>

        </div>

        <div className="z-10 text-center max-w-4xl">
          <div className="mb-6 inline-flex items-center px-4 py-2 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <Plane className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">AI-Powered Aviation Compliance</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            The Intelligence System for <span className="italic text-blue-300">Flight Compliance</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Flinsight keeps aviation operators ahead of FAA updates with contextual
            compliance insights, real-time monitoring, and automated action items.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Try Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            {/* <Link href="/about" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full border-slate-600 text-slate-200 hover:bg-slate-800">
                Learn More
              </Button>
            </Link> */}
          </div>
        </div>

        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
          <div className="animate-bounce">
            <ArrowRight className="h-6 w-6 rotate-90" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How Flinsight Works</h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Flinsight's AI-powered platform keeps you compliant with the latest FAA regulations, contextually applied to your
            specific flight operations.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-6">
            <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Live FAA Update Scanner</h3>
            <p className="text-slate-300">
              Uses NLP to parse new FAA rules, Advisory Circulars, and Legal Interpretations in real time.
            </p>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-6">
            <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Contextual Application</h3>
            <p className="text-slate-300">
              Input flight details and get exactly which new rules apply to your specific operation.
            </p>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-6">
            <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-400"
              >
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Auto-Generated Action Items</h3>
            <p className="text-slate-300">
              Creates checklists, risk analysis, and email templates for crew and vendors.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Stay Updated on Flinsight</h2>
          <p className="text-slate-300 mb-8">
            Join our newsletter to get the latest updates on our product launch and aviation compliance insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input type="email" placeholder="Your Email Address" className="bg-slate-800 border-slate-700 text-white" />
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Get Notified</Button>
          </div>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold">Flinsight</h2>
            <p className="text-slate-400">AI-Powered Aviation Compliance</p>
          </div>

          <div className="text-slate-400 text-sm">© {new Date().getFullYear()} Flinsight. All rights reserved.</div>
        </div>
      </footer>
    </main>
  )
}

