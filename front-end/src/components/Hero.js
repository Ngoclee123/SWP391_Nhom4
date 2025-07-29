import { useState, useEffect } from 'react';
<<<<<<< HEAD
import CozeChat from './CozeChat';
=======
>>>>>>> ngocle_new

function Hero({ onOpenModal }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const heroSlides = [
    {
      title: "Chăm sóc sức khỏe trẻ em toàn diện",
      subtitle: "Đặt lịch khám, tư vấn trực tuyến và theo dõi sức khỏe bé yêu với đội ngũ bác sĩ nhi khoa hàng đầu.",
      image: "/images/banner.jpg",
      bgColor: "from-blue-400 to-blue-600"
    },
    {
      title: "Đội ngũ bác sĩ chuyên nghiệp",
      subtitle: "Với nhiều năm kinh nghiệm trong lĩnh vực nhi khoa, chúng tôi cam kết mang đến dịch vụ tốt nhất cho bé.",
      image: "/images/doctor-team.jpg",
      bgColor: "from-green-400 to-green-600"
    },
    {
      title: "Tư vấn sức khỏe 24/7",
      subtitle: "Luôn sẵn sàng hỗ trợ và tư vấn mọi lúc, mọi nơi. Sức khỏe của bé là ưu tiên hàng đầu.",
      image: "/images/consultation.jpg",
      bgColor: "from-purple-400 to-purple-600"
    },
    {
      title: "Công nghệ hiện đại - An toàn tuyệt đối",
      subtitle: "Ứng dụng công nghệ tiên tiến trong chẩn đoán và điều trị, đảm bảo an toàn cho trẻ em.",
      image: "/images/technology.jpg",
      bgColor: "from-pink-400 to-pink-600"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 8000); // Chuyển slide mỗi 8 giây

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background slides */}
      <div className="absolute inset-0 w-full h-full">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-gradient-to-r ${slide.bgColor} transition-opacity duration-1000 ${
              currentSlide === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-40 right-32 w-24 h-24 bg-white rounded-full animate-bounce delay-300"></div>
              <div className="absolute bottom-32 left-40 w-20 h-20 bg-white rounded-full animate-ping delay-500"></div>
              <div className="absolute bottom-20 right-20 w-28 h-28 bg-white rounded-full animate-pulse delay-700"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 text-center md:text-left text-white">
          {/* Animated title */}
          <h1 
            key={`title-${currentSlide}`}
            className="text-4xl md:text-5xl font-bold mb-4 animate-slide-in-left"
          >
            {heroSlides[currentSlide].title}
          </h1>
          
          {/* Animated subtitle */}
          <p 
            key={`subtitle-${currentSlide}`}
            className="text-lg mb-6 animate-slide-in-left animation-delay-300"
          >
            {heroSlides[currentSlide].subtitle}
          </p>
          
          {/* CTA Button */}
          <div className="animate-slide-in-left animation-delay-600">
            <button 
              onClick={onOpenModal} 
              className="bg-white text-blue-600 px-8 py-4 rounded-full hover:bg-blue-50 hover:scale-105 transform transition duration-300 font-semibold shadow-lg"
            >
              Đặt lịch ngay
            </button>
          </div>

          {/* Sliding text banner */}
          <div className="mt-8 animate-slide-in-left animation-delay-900">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-6 py-3 inline-block">
              <div className="overflow-hidden h-8">
                <div 
                  className="transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateY(-${currentSlide * 32}px)` }}
                >
                  <div className="h-8 flex items-center font-medium">💝 Khuyến mãi đặc biệt tháng này</div>
                  <div className="h-8 flex items-center font-medium">🏥 Đội ngũ bác sĩ hàng đầu</div>
                  <div className="h-8 flex items-center font-medium">⏰ Hỗ trợ 24/7 mọi lúc</div>
                  <div className="h-8 flex items-center font-medium">🛡️ An toàn & Tin cậy</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:w-1/2 mt-8 md:mt-0 relative">
          {/* Main image with transition */}
          <div className="relative">
            <img
              key={`image-${currentSlide}`}
              src={heroSlides[currentSlide].image}
              alt="Baby Health Hub"
              className="rounded-lg shadow-2xl w-full animate-fade-in transform hover:scale-105 transition duration-500"
            />
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-lg animate-bounce">
              <div className="text-2xl">👶</div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-4 shadow-lg animate-pulse">
              <div className="text-2xl">💙</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goToPrevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-3 rounded-full shadow-lg transition duration-300 hover:scale-110 z-20"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={goToNextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-3 rounded-full shadow-lg transition duration-300 hover:scale-110 z-20"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-4 h-4 rounded-full transition duration-300 ${
              currentSlide === index 
                ? 'bg-white scale-125' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
          />
        ))}
      </div>

<<<<<<< HEAD
      {/* Nhúng CozeChat widget */}
      <CozeChat />

      {/* Custom CSS for animations */}
      <style>{`
=======
      {/* Custom CSS for animations */}
      <style jsx>{`
>>>>>>> ngocle_new
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animation-delay-300 {
          animation-delay: 10s;
          opacity: 0;
        }
        
        .animation-delay-600 {
          animation-delay: 10s;
          opacity: 0;
        }
        
        .animation-delay-900 {
          animation-delay: 10s;
          opacity: 0;
        }
      `}</style>
    </section>
  );
}

export default Hero;