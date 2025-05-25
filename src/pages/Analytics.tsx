
import { motion } from "motion/react"

const Analytics = () => {
  return (
    <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white w-full h-full">
      <h1>Analytics</h1>
    </motion.div>
  )
}

export default Analytics
