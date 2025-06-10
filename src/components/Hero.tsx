import { ArrowRight, Leaf, Zap, Globe, Shield, Users, TrendingUp, Award, Star } from 'lucide-react';

interface HeroProps {
  onGetStarted?: () => void;
  onExploreMarketplace?: () => void;
  onIRECAdmin?: () => void; 
}

export default function Hero({ onGetStarted, onExploreMarketplace }: HeroProps) {
  const handleGetStarted = () => {
    if (onGetStarted) onGetStarted();
  };

  const handleExploreMarketplace = () => {
    if (onExploreMarketplace) onExploreMarketplace();
  };

  return (
    <div className="relative -mt-8 mb-0">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 md:px-12 lg:px-24 relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-green-300/40 to-green-300/40 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr from-green-300/30 to-emerald-300/30 blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-green-300/20 to-green-300/20 blur-2xl animate-spin" style={{animationDuration: '20s'}}></div>
          <div className="absolute bottom-40 right-1/4 w-64 h-64 rounded-full bg-gradient-to-l from-green-300/30 to-emerald-300/30 blur-2xl animate-bounce" style={{animationDuration: '15s'}}></div>
        </div>
        

        {/* Floating Icons with Enhanced Animation */}
        <div className="absolute top-20 left-10 opacity-30 animate-bounce">
          <Leaf className="w-10 h-10 text-green-600" />
        </div>
        <div className="absolute top-32 right-20 opacity-30 animate-bounce" style={{animationDelay: '0.5s'}}>
          <Zap className="w-8 h-8 text-emerald-600" />
        </div>
        <div className="absolute bottom-32 left-16 opacity-30 animate-bounce" style={{animationDelay: '1s'}}>
          <Globe className="w-9 h-9 text-emerald-600" />
        </div>
        <div className="absolute top-40 right-40 opacity-20 animate-bounce" style={{animationDelay: '0.7s'}}>
          <Shield className="w-6 h-6 text-green-500" />
        </div>

        <div className="max-w-7xl w-full text-center relative z-10">
          {/* Main Heading */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold text-gray-800 mb-6 leading-tight">
              <span className="inline-block bg-gradient-to-r from-green-600 via-emerald-500 to-green-700 bg-clip-text text-transparent">
                Creating a
              </span>{' '}
              <span className="relative inline-block">
                Sustainable Future
                <div className="absolute -bottom-3 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-emerald-400 to-blue-400 rounded-full"></div>
              </span>
              <span className="block mt-4 text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent">
                with Renewable Energy Solutions
              </span>
            </h1>
          </div>

          {/* Enhanced Description */}
          <div className="mb-16">
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
              Discover the amazing ways renewable energy can transform communities across Africa through innovative 
              <span className="font-semibold text-green-700"> IREC certification</span> and 
              <span className="font-semibold text-green-700"> blockchain-powered trading</span>.
            </p>
          </div>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-20">
            <button 
              onClick={handleGetStarted}
              className="group relative px-10 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-4 font-semibold text-xl transform hover:scale-105 hover:-translate-y-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              <span className="relative z-10">Buy I-RECs</span>
              <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
            </button>
            
            <button 
              onClick={handleExploreMarketplace}
              className="group relative px-10 py-5 border-3 border-green-600 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-4 font-semibold text-xl transform hover:scale-105 hover:-translate-y-2 backdrop-blur-sm bg-white/90 shadow-xl hover:shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/0 via-green-600/10 to-green-600/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              <span className="relative z-10">View Projects</span>
              <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
            </button>
          </div>

          {/* Trust Indicators */}
          <div>
            <p className="text-lg text-gray-500 mb-8 font-medium">Trusted by renewable energy providers across Africa</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
              <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-medium text-gray-700">IREC Certified</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                <span className="text-lg font-medium text-gray-700">Blockchain Verified</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <span className="text-lg font-medium text-gray-700">Impact Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Why Choose <span className="text-green-600">NEST</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of renewable energy trading with our cutting-edge platform designed for African communities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-8 h-8 text-green-600" />,
                title: "Secure & Verified",
                description: "Every transaction is secured by blockchain technology and verified through IREC standards."
              },
              {
                icon: <TrendingUp className="w-8 h-8 text-green-600" />,
                title: "Market Growth",
                description: "Join the fastest-growing renewable energy marketplace in Africa with proven results."
              },
              {
                icon: <Users className="w-8 h-8 text-emerald-600" />,
                title: "Community Impact",
                description: "Direct support to local communities through transparent and traceable energy investments."
              },
              {
                icon: <Award className="w-8 h-8 text-green-600" />,
                title: "Certified Quality",
                description: "All energy certificates meet international standards and regulatory requirements."
              },
              {
                icon: <Zap className="w-8 h-8 text-green-600" />,
                title: "Instant Trading",
                description: "Buy and sell renewable energy certificates instantly with our advanced trading platform."
              },
              {
                icon: <Globe className="w-8 h-8 text-green-600" />,
                title: "Global Reach",
                description: "Connect with renewable energy projects across Africa and make a global impact."
              }
            ].map((feature, index) => (
              <div key={index} className="group p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section - Full Screen Background */}
      <section className="relative py-24 min-h-screen flex items-center">
        {/* Full screen gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600"></div>
        
        {/* Enhanced background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-400/30 to-green-400/30 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-tr from-green-400/20 to-emerald-400/20 blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 right-1/3 w-80 h-80 rounded-full bg-gradient-to-l from-white/10 to-emerald-300/20 blur-2xl animate-bounce" style={{animationDuration: '20s'}}></div>
        </div>

        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 text-white">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Impact in Numbers</h2>
              <p className="text-xl text-green-100 max-w-3xl mx-auto">
                See how we're making a real difference in renewable energy across Africa.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { number: "50,000+", label: "I-RECs Traded", icon: <Award className="w-8 h-8" /> },
                { number: "120+", label: "Projects Listed", icon: <TrendingUp className="w-8 h-8" /> },
                { number: "25", label: "Countries Served", icon: <Globe className="w-8 h-8" /> },
                { number: "1M+ MWh", label: "Clean Energy Certified", icon: <Zap className="w-8 h-8" /> }
              ].map((stat, index) => (
                <div key={index} className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <div className="mb-4 flex justify-center text-green-200">
                    {stat.icon}
                  </div>
                  <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                  <div className="text-green-100 text-lg">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-24">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">What Our Partners Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from renewable energy providers who are transforming communities with NEST.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "NEST has revolutionized how we trade renewable energy certificates. The platform is intuitive and the blockchain verification gives us complete confidence.",
                name: "Dr. Amara Okafor",
                title: "Solar Project Director",
                company: "GreenLight Energy Nigeria"
              },
              {
                quote: "The impact tracking features help us show our investors exactly how their funds are creating positive change in local communities.",
                name: "James Mwangi",
                title: "Renewable Energy Manager",
                company: "EcoVolt Kenya"
              },
              {
                quote: "Trading I-RECs has never been this simple. NEST's platform has opened up new markets for our wind energy projects.",
                name: "Fatima Al-Rashid",
                title: "Project Coordinator",
                company: "WindPower Morocco"
              }
            ].map((testimonial, index) => (
              <div key={index} className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-green-600 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.quote}"</p>
                <div className="border-t pt-6">
                  <div className="font-semibold text-gray-800">{testimonial.name}</div>
                  <div className="text-gray-600">{testimonial.title}</div>
                  <div className="text-green-600 font-medium">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Section - Full Screen Background */}
      <section className="relative py-24 min-h-screen flex items-center">
        {/* Full screen gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
        
        {/* Enhanced background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-gradient-to-br from-green-600/20 to-emerald-600/20 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-gradient-to-tr from-blue-600/10 to-green-600/10 blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-emerald-600/10 to-green-600/10 blur-2xl animate-spin" style={{animationDuration: '30s'}}></div>
        </div>

        <div className="relative z-10 w-full">
          <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-24 text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Ready to Transform Energy Trading?
            </h2>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              Join thousands of renewable energy providers who are already using NEST to create sustainable impact across Africa.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button 
                onClick={handleGetStarted}
                className="group px-10 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center gap-4 font-semibold text-xl transform hover:scale-105"
              >
                <span>Start Trading Now</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </button>
              
              <button 
                onClick={handleExploreMarketplace}
                className="px-10 py-5 border-2 border-white text-white rounded-2xl hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center justify-center gap-4 font-semibold text-xl transform hover:scale-105"
              >
                <span>Explore Marketplace</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}