'use client';
import { useEffect, useMemo, useState } from 'react';

const CATS = ['Все','🎥 Съёмка','👕 Одежда','👟 Обувь','💻 Техника','🏠 Дом','🚗 Авто','🎮 Развлечения','✈️ Путешествия','📦 Другое'];
const KEY='jasur-wishlist-v1';
const SEED=[
 {id:'seed-kf',archived:false,createdAt:Date.now(),name:'K&F Concept — крепление для камеры',price:0,category:'🎥 Съёмка',note:'Для съёмки. Сумму можно вписать позже.',photo:''},
 {id:'seed-lowglow',archived:false,createdAt:Date.now(),name:'LowGlow — подсветка днища автомобиля',price:380000,category:'🚗 Авто',note:'Где купить: t.me/svetaforuz',photo:''},
 {id:'seed-viltrox',archived:false,createdAt:Date.now(),name:'Viltrox AF 35mm F/1.7 — объектив',price:1900000,category:'🎥 Съёмка',note:'Где купить: Arzon Gadget',photo:''}
];

function money(n){ return new Intl.NumberFormat('ru-RU').format(Number(n)||0)+' сум'; }
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }

export default function Home(){
 const [items,setItems]=useState([]); const [tab,setTab]=useState('active'); const [cat,setCat]=useState('Все'); const [search,setSearch]=useState('');
 const [modal,setModal]=useState(false); const [editing,setEditing]=useState(null);
 useEffect(()=>{ try{const raw=localStorage.getItem(KEY); if(raw)setItems(JSON.parse(raw)); else setItems(SEED);}catch{setItems(SEED)} },[]);
 useEffect(()=>{if(items.length)localStorage.setItem(KEY,JSON.stringify(items));},[items]);
 const active=items.filter(x=>!x.archived); const archived=items.filter(x=>x.archived);
 const visible=useMemo(()=>items.filter(x=>(tab==='active'?!x.archived:x.archived)&&(cat==='Все'||x.category===cat)&&((x.name||'').toLowerCase().includes(search.toLowerCase())||(x.category||'').toLowerCase().includes(search.toLowerCase()))),[items,tab,cat,search]);
 const total=active.reduce((s,x)=>s+(Number(x.price)||0),0), bought=archived.reduce((s,x)=>s+(Number(x.price)||0),0);
 function save(data){ if(editing) setItems(items.map(x=>x.id===editing.id?{...x,...data}:x)); else setItems([{id:uid(),archived:false,createdAt:Date.now(),...data},...items]); setModal(false);setEditing(null); }
 function toggle(id){setItems(items.map(x=>x.id===id?{...x,archived:!x.archived}:x));}
 function remove(id){if(confirm('Удалить эту хотелку?'))setItems(items.filter(x=>x.id!==id));}
 return <main>
  <header className="top"><div><div className="eyebrow">PERSONAL WISHLIST</div><h1>Мои хотелки</h1><p>Фото → категория → галерея → куплено → архив.</p></div><button className="add" onClick={()=>{setEditing(null);setModal(true)}}>＋ Добавить</button></header>
  <section className="stats"><div><span>Активных</span><b>{active.length}</b></div><div><span>Общая сумма</span><b>{money(total)}</b></div><div><span>Куплено</span><b>{archived.length}</b></div><div><span>Потрачено</span><b>{money(bought)}</b></div></section>
  <div className="controls"><div className="tabs"><button className={tab==='active'?'sel':''} onClick={()=>setTab('active')}>Хотелки</button><button className={tab==='archive'?'sel':''} onClick={()=>setTab('archive')}>📦 Архив</button></div><input placeholder="Поиск..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
  <div className="cats">{CATS.map(c=><button key={c} className={cat===c?'cat active':'cat'} onClick={()=>setCat(c)}>{c}</button>)}</div>
  {visible.length===0?<div className="empty"><div>✨</div><h2>{tab==='active'?'Пока пусто':'Архив пуст'}</h2><p>{tab==='active'?'Добавь первую хотелку — фото, название и сумму.':'Купленные вещи появятся здесь.'}</p></div>:<div className="grid">{visible.map(x=><article className="card" key={x.id}>
    <div className="photo">{x.photo?<img src={x.photo} alt=""/>:<div className="placeholder">{x.category?.split(' ')[0]||'✨'}</div>}<button className={'check '+(x.archived?'done':'')} onClick={()=>toggle(x.id)}>{x.archived?'✓':'○'}</button></div>
    <div className="body"><div className="tag">{x.category}</div><h3>{x.name||'Без названия'}</h3><div className="price">{x.price?money(x.price):'Сумма не указана'}</div>{x.note&&<p className="note">{x.note}</p>}<div className="actions"><button onClick={()=>{setEditing(x);setModal(true)}}>✎ Изменить</button><button onClick={()=>remove(x.id)}>Удалить</button></div></div>
  </article>)}</div>}
  {modal&&<Modal editing={editing} onClose={()=>{setModal(false);setEditing(null)}} onSave={save}/>} 
 </main>
}
function Modal({editing,onClose,onSave}){
 const [name,setName]=useState(editing?.name||''); const [price,setPrice]=useState(editing?.price||''); const [category,setCategory]=useState(editing?.category||'📦 Другое'); const [note,setNote]=useState(editing?.note||''); const [photo,setPhoto]=useState(editing?.photo||'');
 function photoPick(e){const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>setPhoto(r.result);r.readAsDataURL(f)}
 return <div className="overlay"><div className="modal"><div className="modalHead"><h2>{editing?'Изменить хотелку':'Новая хотелка'}</h2><button onClick={onClose}>×</button></div><label>Фото<input type="file" accept="image/*" onChange={photoPick}/></label>{photo&&<img className="preview" src={photo} alt="preview"/>}<label>Название<input value={name} onChange={e=>setName(e.target.value)} placeholder="Например: крепление K&F Concept"/></label><label>Сумма, сум<input type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="0"/></label><label>Категория<select value={category} onChange={e=>setCategory(e.target.value)}>{CATS.filter(x=>x!=='Все').map(c=><option key={c}>{c}</option>)}</select></label><label>Комментарий<textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Ссылка, модель, магазин..."/></label><button className="save" onClick={()=>onSave({name,price:Number(price)||0,category,note,photo})}>Сохранить</button></div></div>
 }