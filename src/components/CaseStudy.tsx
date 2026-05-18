import { motion } from 'motion/react';
import { Key } from 'react';
import { CaseStudy as CaseStudyType } from '../data/caseStudies';

interface CaseStudyProps {
  key?: Key;
  study: CaseStudyType;
}

export default function CaseStudyComponent({ study }: CaseStudyProps) {
  const isCream = study.type === 'cream';
  const isOdd = study.type === 'odd';
  
  return (
    <section className={`min-h-screen py-32 px-8 md:px-20 relative overflow-hidden flex items-center ${
      isCream ? 'bg-cream2 text-espresso' : isOdd ? 'bg-dark' : 'bg-dark2'
    }`}>
      {/* Background Accent Number */}
      <div className={`absolute right-10 top-1/2 -translate-y-1/2 font-serif text-[clamp(150px,25vw,320px)] font-bold opacity-[0.03] select-none pointer-events-none transition-colors duration-500 ${
        isCream ? 'text-amber' : 'text-gold'
      }`}>
        {study.id}
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className={`text-[10px] font-bold tracking-[5px] uppercase mb-2 ${isCream ? 'text-amber' : 'text-gold'}`}>
            Case Study {study.id}
          </div>
          <div className={`font-serif text-[13px] tracking-[3px] uppercase mb-4 ${isCream ? 'text-warm-gray2' : 'text-gold-pale'}`}>
            {study.brand}
          </div>
          <h2 className={`font-serif text-[clamp(30px,4vw,52px)] font-semibold leading-[1.1] mb-8 max-w-3xl ${isCream ? 'text-espresso' : 'text-white'}`}>
            {study.title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className={`text-[9px] font-bold tracking-[3px] uppercase mb-2 ${isCream ? 'text-amber' : 'text-gold'}`}>
              {study.subtitle}
            </div>
            <p className={`text-sm leading-relaxed font-light mb-6 ${isCream ? 'text-espresso/70' : 'text-cream/90'}`}>
              {study.innovation?.content || study.approach}
            </p>

            {study.strategy && (
              <>
                <div className={`text-[9px] font-bold tracking-[3px] uppercase mb-2 mt-6 ${isCream ? 'text-amber' : 'text-gold'}`}>
                  {study.strategy.label}
                </div>
                <p className={`text-sm leading-relaxed font-light ${isCream ? 'text-espresso/70' : 'text-cream/90'}`}>
                  {study.strategy.content}
                </p>
              </>
            )}

            {study.details && (
              <p className={`text-sm leading-relaxed font-light mt-6 ${isCream ? 'text-espresso/70' : 'text-cream/90'}`}>
                {study.details}
              </p>
            )}

            {study.insight && (
              <div className={`mt-8 p-6 rounded-r-lg border-l-4 ${
                isCream ? 'bg-amber/10 border-amber' : 'bg-gold/10 border-gold'
              }`}>
                <div className={`text-[9px] font-bold tracking-[3px] uppercase mb-2 ${isCream ? 'text-amber' : 'text-gold-light'}`}>
                  {study.insight.label}
                </div>
                <p className={`font-serif text-lg italic ${isCream ? 'text-amber/90' : 'text-gold-pale'}`}>
                  "{study.insight.text}"
                </p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className={`grid grid-cols-2 gap-8 ${!study.insight ? 'mt-0' : 'mt-0 md:mt-12'}`}>
              {study.metrics.map((metric, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className={`font-serif text-4xl font-bold ${isCream ? 'text-amber' : 'text-gold'}`}>
                    {metric.value}
                  </div>
                  <div className={`text-[10px] tracking-[2px] uppercase ${isCream ? 'text-espresso/50' : 'text-cream/60'}`}>
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mt-12 pt-12 border-t border-current opacity-20">
              {study.tags.map((tag, idx) => (
                <span key={idx} className={`px-4 py-1.5 rounded-sm text-[10px] font-semibold tracking-wider uppercase border ${
                  isCream ? 'bg-amber/10 border-amber/20 text-amber' : 'bg-gold/10 border-gold/20 text-gold'
                }`}>
                  {tag}
                </span>
              ))}
            </div>

            {study.conclusion && (
              <div className="mt-12">
                <div className={`text-[9px] font-bold tracking-[3px] uppercase mb-2 ${isCream ? 'text-amber' : 'text-gold'}`}>
                  The Impact
                </div>
                <p className={`text-sm leading-relaxed font-light ${isCream ? 'text-espresso/70' : 'text-cream/90'}`}>
                  {study.conclusion}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
