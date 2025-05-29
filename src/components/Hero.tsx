interface HeroProps {
  onGetStarted: () => void;
  onExploreMarketplace: () => void;
  onIRECAdmin?: () => void; 
}

export default function Hero({ onGetStarted, onExploreMarketplace }: HeroProps) {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 md:px-12 lg:px-24 bg-white">
        <div className="max-w-7xl w-full text-center">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-gray-800 mb-8">
            <span className="text-green-600">Tokenized</span> Carbon Credits for Climate Action
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join the carbon credit revolution and make a real difference. Purchase verified carbon offsets starting from $5 and directly contribute to global decarbonization efforts.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-semibold text-lg transform hover:scale-105"
            >
              Buy Carbon Credits
            </button>
            <button 
              onClick={onExploreMarketplace}
              className="px-8 py-4 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 font-semibold text-lg transform hover:scale-105"
            >
              View Projects
            </button>
          </div>
        </div>
      </section>
  )
}