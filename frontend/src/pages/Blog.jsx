import React from 'react';

function Blog() {
  const posts = [
    {
      title: "Quiz Battle-де қалай жеңіске жетуге болады?",
      excerpt: "Бүгінгі мақалада біз ойын кезінде жылдам әрі дұрыс жауап берудің құпияларымен бөлісеміз...",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Жаңа сұрақтар жинағы: Тарих және География",
      excerpt: "Біздің платформаға Қазақстан тарихы мен әлем географиясы бойынша 100-ден астам жаңа сұрақ қосылды.",
      image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <main className="page-container">
      <h2 className="section-title">Блог</h2>
      <div className="blog" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        {posts.map((post, index) => (
          <div key={index} className="blog-post card" style={{ padding: '0', overflow: 'hidden' }}>
            <img src={post.image} alt={post.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            <div style={{ padding: '20px' }}>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <button className="btn" style={{ marginTop: '15px' }}>Толығырақ</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Blog;
