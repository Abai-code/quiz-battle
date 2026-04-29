import React, { useState } from 'react';
import Card from '../components/Card';

function AccordionItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="card" 
      style={{ 
        padding: '0', 
        marginBottom: '15px', 
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px 25px' 
      }}>
        <h4 style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}>{question}</h4>
        <span style={{ 
          fontSize: '1.8rem', 
          fontWeight: 'bold', 
          color: 'var(--primary-color)', 
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
          minWidth: '30px',
          textAlign: 'center'
        }}>+</span>
      </div>
      <div style={{
        maxHeight: isOpen ? '200px' : '0',
        opacity: isOpen ? 1 : 0,
        padding: isOpen ? '0 25px 20px' : '0 25px',
        transition: 'all 0.3s ease',
        overflow: 'hidden'
      }}>
        <p style={{ opacity: 0.8, lineHeight: '1.7' }}>{answer}</p>
      </div>
    </div>
  );
}

function Services() {
  const faqData = [
    {
      question: "Қалай тіркелуге болады?",
      answer: "Тіркелу өте оңай! Жоғарғы оң жақ бұрыштағы немесе Кіру бетіндегі \"Тіркелу\" сілтемесіне өтіп, атыңыз бен поштаңызды енгізсеңіз болғаны."
    },
    {
      question: "Рейтинг қалай есептеледі?",
      answer: "Рейтинг әрбір жеңіске жеткен матчқа байланысты ұпай қосу арқылы есептеледі. Пайызыңыз қаншалықты жоғары болса, рейтингте соншалықты жоғары боласыз."
    },
    {
      question: "Ойынды қайта бастауға бола ма?",
      answer: "Иә! Тестті кез келген уақытта қайта тапсыра аласыз. Жаңа ұпайларыңыз ескілеріне қосыла береді."
    },
    {
      question: "Мұғалім ретінде не істей аламын?",
      answer: "Мұғалім ретінде тіркелсеңіз, Админ панеліне кіріп, жаңа сұрақтар қосуға, студенттерді басқаруға және рейтингті бақылауға болады."
    }
  ];

  return (
    <main className="page-container">
      <h2 className="section-title">Қызметтер</h2>
      <div className="services" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <Card title="PvP Жарыстар">
          <p>Достарыңызбен немесе кездейсоқ қарсыластармен 1-ге 1 форматында Quiz ойнаңыз. Кім жылдам әрі дұрыс жауап береді, сол жеңеді!</p>
        </Card>
        <Card title="Рейтинг және Статистика">
          <p>Сіздің әрбір дұрыс жауабыңыз бағаланады. Дүниежүзілік рейтингте жоғары көтеріліп, жеке статистикаңызды бақылаңыз.</p>
        </Card>
        <Card title="Кастомды сұрақтар қосу">
          <p>Өз достарыңыз үшін арнайы сұрақтар дайындаңыз немесе мектеп турнирлерін ұйымдастырыңыз. Quiz жасау мүмкіндігі ашық.</p>
        </Card>
      </div>

      <h2 className="section-title" style={{ marginTop: '60px' }}>Жиі қойылатын сұрақтар</h2>
      <div className="faq-section">
        {faqData.map((item, index) => (
          <AccordionItem key={index} question={item.question} answer={item.answer} />
        ))}
      </div>
    </main>
  );
}

export default Services;
