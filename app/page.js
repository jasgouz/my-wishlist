'use client';
import { useEffect, useMemo, useState } from 'react';

const CATS = ['Все','🎥 Съёмка','👕 Одежда','👟 Обувь','💻 Техника','🏠 Дом','🚗 Авто','🎮 Развлечения','✈️ Путешествия','📦 Другое'];
const KEY = 'jasur-wishlist-v2';
const SEED = [
  {id:'kf',archived:false,name:'K&F Concept — крепление для камеры',price:0,category:'🎥 Съёмка',note:'Крепление для съёмки.',photo:'/wishlist/kf.webp'},
  {id:'lowglow',archived:false,name:'LowGlow — подсветка днища автомобиля',price:380000,category:'🚗 Авто',note:'Где купить: SvetaforUZ',link:'https://t.me/svetaforuz',photo:'/wishlist/car.webp'},
  {id:'viltrox',archived:false,name:'Viltrox AF 35mm F/1.7 — объектив',price:1900000,category:'🎥 Съёмка',note:'Где купить: Arzon Gadget',photo:'/wishlist/lens.webp'}
];

const money = n => n ? new Intl.NumberFormat('ru-RU').format(Number(n))+' сум' : 'Сумма не указана';
const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,7);

export default function Home(){
  const [items,setItems] = useState([]);
  const [tab,setTab] = useState('active');
  const [cat,setCat] = useState('Все');
  const [search,setSearch] = useState('');
  const [editing,setEditing] = useState(null);
  const [open,setOpen] = useState(false);

  useEffect(()=>{
    const raw = localStorage.getItem(KEY);
    setItems(raw ? JSON.parse(raw) : SEED);
  },[]);
  useEffect(()=>{
    if(items.length) localStorage.setItem(KEY,JSON.stringify(items));
  },[items]);

  const active = items.filter(x=>!x.archived);
  const archived = items.filter(x=>x.archived);
  const total = active.reduce((s,x)=>s+(Number(x.price)||0),0);
  const bought = archived.reduce((s,x)=>s+(Number(x.price)||0),0);

  const visible = useMemo(()=>items.filter(x=>{
    const status = tab==='active' ? !x.archived : x.archived;
    const category = cat==='Все' || x.category===cat;
    const q = search.toLowerCase().trim();
    return status && category && (!q || (x.name||'').toLowerCase().includes(q) || (x.note||'').toLowerCase().includes(q));
  }),[items,tab,cat,search]);

  function save(data){
    setItems(prev => editing ? prev.map(x=>x.id===editing.id?{...x,...data}:x) : [{id:uid(),archived:false,...data},...prev]);
    setOpen(false); setEditing(null);
  }
  function toggle(id){setItems(prev=>prev.map(x=>x.id===id?{...x,archived:!x.archived}:x));}
  function remove(id){setItems(prev=>prev.filter(x=>x.id!==id));}

  return <main>
    <header className="hero">
      <div>
        <div className="eyebrow">PERSONAL WISHLIST</div>
        <h1>Мои хотелки</h1>
        <p>Собирай желания в одном месте. Фото, цена, категория и магазин — всё в одной карточке.</p>
      </div>
      <button className="primary" onClick={()=>{setEditing(null);setOpen(true)}}>＋ Добавить</button>
    </header>

    <section className="summary">
      <div><span>Активные</span><strong>{active.length}</strong><small>хотелок</small></div>
      <div><span>Общая сумма</span><strong>{money(total)}</strong><small>на покупку</small></div>
      <div><span>Куплено</span><strong>{archived.length}</strong><small>в архиве</small></div>
      <div><span>Потрачено</span><strong>{money(bought)}</strong><small>за всё время</small></div>
    </section>

    <section className="toolbar">
      <div className="segmented">
        <button className={tab==='active'?'selected':''} onClick={()=>setTab('active')}>Хотелки</button>
        <button className={tab==='archive'?'selected':''} onClick={()=>setTab('archive')}>📦 Архив</button>
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Поиск по названию..." />
    </section>

    <nav className="categories">
      {CATS.map(x=><button key={x} className={cat===x?'active':''} onClick={()=>setCat(x)}>{x}</button>)}
    </nav>

    {visible.length===0 ? <div className="empty"><div>✨</div><h2>{tab==='active'?'Нет хотелок':'Архив пуст'}</h2><p>Добавь первую вещь — она появится здесь.</p></div> :
      <section className="grid">{visible.map(x=><article className="card" key={x.id}>
        <div className="imageWrap">
          {x.photo ? <img src={x.photo} alt={x.name}/> : <div className="imageFallback">{x.category?.split(' ')[0]||'✨'}</div>}
          <button className={'roundCheck '+(x.archived?'checked':'')} onClick={()=>toggle(x.id)} aria-label="Куплено">{x.archived?'✓':'○'}</button>
        </div>
        <div className="cardBody">
          <div className="meta"><span>{x.category}</span>{x.archived&&<b>КУПЛЕНО</b>}</div>
          <h3>{x.name}</h3>
          <div className="cardPrice">{money(x.price)}</div>
          {x.note&&<p>{x.note}</p>}
          <div className="cardActions">
            {x.link&&<a href={x.link} target="_blank" rel="noreferrer">Открыть магазин ↗</a>}
            <button onClick={()=>{setEditing(x);setOpen(true)}}>Изменить</button>
            <button onClick={()=>remove(x.id)}>Удалить</button>
          </div>
        </div>
      </article>)}</section>
    }

    {open&&<WishModal editing={editing} onClose={()=>{setOpen(false);setEditing(null)}} onSave={save}/>}
  </main>
}

function WishModal({editing,onClose,onSave}){
  const [name,setName]=useState(editing?.name||'');
  const [price,setPrice]=useState(editing?.price||'');
  const [category,setCategory]=useState(editing?.category||'📦 Другое');
  const [note,setNote]=useState(editing?.note||'');
  const [link,setLink]=useState(editing?.link||'');
  const [photo,setPhoto]=useState(editing?.photo||'');

  function pick(e){
    const f=e.target.files?.[0]; if(!f)return;
    const r=new FileReader(); r.onload=()=>setPhoto(r.result); r.readAsDataURL(f);
  }

  return <div className="overlay"><div className="modal">
    <div className="modalHead"><div><div className="eyebrow">WISHLIST ITEM</div><h2>{editing?'Изменить':'Новая хотелка'}</h2></div><button className="close" onClick={onClose}>×</button></div>
    <label>Фото<input type="file" accept="image/*" onChange={pick}/></label>
    {photo&&<img className="modalPreview" src={photo} alt="preview"/>}
    <label>Название<input value={name} onChange={e=>setName(e.target.value)} placeholder="Например: объектив Viltrox"/></label>
    <label>Сумма, сум<input type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="0"/></label>
    <label>Категория<select value={category} onChange={e=>setCategory(e.target.value)}>{CATS.filter(x=>x!=='Все').map(x=><option key={x}>{x}</option>)}</select></label>
    <label>Где купить / ссылка<input value={link} onChange={e=>setLink(e.target.value)} placeholder="https://..."/></label>
    <label>Комментарий<textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Модель, магазин, заметка..."/></label>
    <button className="save" onClick={()=>onSave({name,price:Number(price)||0,category,note,link,photo})}>Сохранить</button>
  </div></div>
}