import Footer from '../../components/student/Footer'

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="md:px-36 px-8 pt-20 text-left max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 border-b pb-4">Privacy Policy</h1>
        
        <div className="space-y-8 text-gray-600 leading-relaxed">
            <p className="text-lg">
            At EduStack, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website and services.
            </p>

            <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">Information We Collect</h2>
                <p className="mb-2">We collect information you provide directly to us, such as when you create an account, enroll in a course, or contact support. This may include:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Name and contact information</li>
                    <li>Account credentials</li>
                    <li>Payment information (processed securely by our payment providers)</li>
                    <li>Course progress and usage data</li>
                </ul>
            </div>

            <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">How We Use Your Information</h2>
                <p className="mb-2">We use your information to:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process transactions and send related information</li>
                    <li>Send you technical notices, updates, and support messages</li>
                    <li>Respond to your comments and questions</li>
                </ul>
            </div>

            <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">Data Security</h2>
                <p>
                We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
                </p>
            </div>

            <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">Cookies</h2>
                <p>
                We use cookies and similar tracking technologies to track the activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                </p>
            </div>
            
             <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">Contact Us</h2>
                <p>
                If you have any questions about this Privacy Policy, please contact us at support@edustack.com.
                </p>
            </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Privacy
