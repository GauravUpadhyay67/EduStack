import Footer from '../../components/student/Footer'

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="md:px-36 px-8 pt-20 text-left">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="md:w-1/2">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">About <span className="text-blue-600">EduStack</span></h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Welcome to EduStack, your premier destination for online learning. We are dedicated to providing high-quality, accessible education to learners worldwide. Our platform connects passionate educators with eager students, fostering a community of growth and innovation.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our mission is to empower individuals with the skills they need to succeed in their careers and personal lives. Whether you're looking to master a new technology, improve your business acumen, or explore a creative passion, EduStack has the resources you need.
            </p>
          </div>
          <div className="md:w-1/2 flex justify-center">
             {/* Placeholder for an about image if available, otherwise using logo or just a nice gradient box */}
             <div className="w-full h-64 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-500 font-semibold text-xl">Empowering Learning</span>
             </div>
          </div>
        </div>

        <div className="mt-20">
            <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Why Choose Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-medium text-gray-800 mb-3">Expert Instructors</h3>
                    <p className="text-gray-600 text-sm">Learn from industry experts who are passionate about teaching and sharing their knowledge.</p>
                </div>
                <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-medium text-gray-800 mb-3">Flexible Learning</h3>
                    <p className="text-gray-600 text-sm">Study at your own pace, anytime, anywhere. Our platform is designed to fit your lifestyle.</p>
                </div>
                <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-medium text-gray-800 mb-3">Community Support</h3>
                    <p className="text-gray-600 text-sm">Join a vibrant community of learners. Share ideas, ask questions, and grow together.</p>
                </div>
            </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default About
