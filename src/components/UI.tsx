import { motion } from 'motion/react';
import { ReactNode, Key } from 'react';

interface FeatureCardProps {
  icon: string | ReactNode;
  title: string;
  description: string;
  index?: number;
}

export function FeatureCard({ icon, title, description, index = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-dark2 border border-gold/10 rounded overflow-hidden p-10 group relative h-full"
    >
      <div className="absolute top-0 left-0 w-[3px] h-0 bg-gold transition-all duration-500 group-hover:h-full" />
      <div className="text-3xl mb-6 block">{icon}</div>
      <h3 className="font-serif text-2xl font-semibold text-white mb-4 line-height-[1.2]">
        {title}
      </h3>
      <p className="text-[13px] leading-relaxed text-cream/70 font-light">
        {description}
      </p>
    </motion.div>
  );
}

interface ServiceItemProps {
  key?: Key;
  number: string;
  title: string;
  description: string;
  index: number;
}

export function ServiceItem({ number, title, description, index }: ServiceItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="bg-dark2 p-10 group relative border-b border-gold/15 last:border-b-0 md:border-r md:last:border-r-0 hover:bg-dark3 transition-colors duration-300"
    >
      <div className="font-serif text-5xl font-light text-gold/15 leading-none mb-4 group-hover:text-gold/30 transition-colors">
        {number}
      </div>
      <h4 className="font-sans text-sm font-semibold text-white mb-3 tracking-wide uppercase">
        {title}
      </h4>
      <p className="text-[13px] leading-relaxed text-cream/60 font-light">
        {description}
      </p>
    </motion.div>
  );
}
