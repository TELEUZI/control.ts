var X=Object.defineProperty;var Z=(e,t,s)=>t in e?X(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s;var d=(e,t,s)=>(Z(e,typeof t!="symbol"?t+"":t,s),s);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))o(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function s(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(i){if(i.ep)return;i.ep=!0;const r=s(i);fetch(i.href,r)}})();function P(){throw new Error("Cycle detected")}var tt=Symbol.for("preact-signals");function I(){if(x>1)x--;else{for(var e,t=!1;M!==void 0;){var s=M;for(M=void 0,T++;s!==void 0;){var o=s.o;if(s.o=void 0,s.f&=-3,!(8&s.f)&&K(s))try{s.c()}catch(i){t||(e=i,t=!0)}s=o}}if(T=0,x--,t)throw e}}var c=void 0,M=void 0,x=0,T=0,L=0;function U(e){if(c!==void 0){var t=e.n;if(t===void 0||t.t!==c)return t={i:0,S:e,p:c.s,n:void 0,t:c,e:void 0,x:void 0,r:t},c.s!==void 0&&(c.s.n=t),c.s=t,e.n=t,32&c.f&&e.S(t),t;if(t.i===-1)return t.i=0,t.n!==void 0&&(t.n.p=t.p,t.p!==void 0&&(t.p.n=t.n),t.p=c.s,t.n=void 0,c.s.n=t,c.s=t),t}}function h(e){this.v=e,this.i=0,this.n=void 0,this.t=void 0}h.prototype.brand=tt;h.prototype.h=function(){return!0};h.prototype.S=function(e){this.t!==e&&e.e===void 0&&(e.x=this.t,this.t!==void 0&&(this.t.e=e),this.t=e)};h.prototype.U=function(e){if(this.t!==void 0){var t=e.e,s=e.x;t!==void 0&&(t.x=s,e.e=void 0),s!==void 0&&(s.e=t,e.x=void 0),e===this.t&&(this.t=s)}};h.prototype.subscribe=function(e){var t=this;return J(function(){var s=t.value,o=32&this.f;this.f&=-33;try{e(s)}finally{this.f|=o}})};h.prototype.valueOf=function(){return this.value};h.prototype.toString=function(){return this.value+""};h.prototype.toJSON=function(){return this.value};h.prototype.peek=function(){return this.v};Object.defineProperty(h.prototype,"value",{get:function(){var e=U(this);return e!==void 0&&(e.i=this.i),this.v},set:function(e){if(c instanceof m&&function(){throw new Error("Computed cannot have side-effects")}(),e!==this.v){T>100&&P(),this.v=e,this.i++,L++,x++;try{for(var t=this.t;t!==void 0;t=t.x)t.t.N()}finally{I()}}}});function w(e){return new h(e)}function K(e){for(var t=e.s;t!==void 0;t=t.n)if(t.S.i!==t.i||!t.S.h()||t.S.i!==t.i)return!0;return!1}function B(e){for(var t=e.s;t!==void 0;t=t.n){var s=t.S.n;if(s!==void 0&&(t.r=s),t.S.n=t,t.i=-1,t.n===void 0){e.s=t;break}}}function H(e){for(var t=e.s,s=void 0;t!==void 0;){var o=t.p;t.i===-1?(t.S.U(t),o!==void 0&&(o.n=t.n),t.n!==void 0&&(t.n.p=o)):s=t,t.S.n=t.r,t.r!==void 0&&(t.r=void 0),t=o}e.s=s}function m(e){h.call(this,void 0),this.x=e,this.s=void 0,this.g=L-1,this.f=4}(m.prototype=new h).h=function(){if(this.f&=-3,1&this.f)return!1;if((36&this.f)==32||(this.f&=-5,this.g===L))return!0;if(this.g=L,this.f|=1,this.i>0&&!K(this))return this.f&=-2,!0;var e=c;try{B(this),c=this;var t=this.x();(16&this.f||this.v!==t||this.i===0)&&(this.v=t,this.f&=-17,this.i++)}catch(s){this.v=s,this.f|=16,this.i++}return c=e,H(this),this.f&=-2,!0};m.prototype.S=function(e){if(this.t===void 0){this.f|=36;for(var t=this.s;t!==void 0;t=t.n)t.S.S(t)}h.prototype.S.call(this,e)};m.prototype.U=function(e){if(this.t!==void 0&&(h.prototype.U.call(this,e),this.t===void 0)){this.f&=-33;for(var t=this.s;t!==void 0;t=t.n)t.S.U(t)}};m.prototype.N=function(){if(!(2&this.f)){this.f|=6;for(var e=this.t;e!==void 0;e=e.x)e.t.N()}};m.prototype.peek=function(){if(this.h()||P(),16&this.f)throw this.v;return this.v};Object.defineProperty(m.prototype,"value",{get:function(){1&this.f&&P();var e=U(this);if(this.h(),e!==void 0&&(e.i=this.i),16&this.f)throw this.v;return this.v}});function p(e){return new m(e)}function V(e){var t=e.u;if(e.u=void 0,typeof t=="function"){x++;var s=c;c=void 0;try{t()}catch(o){throw e.f&=-2,e.f|=8,A(e),o}finally{c=s,I()}}}function A(e){for(var t=e.s;t!==void 0;t=t.n)t.S.U(t);e.x=void 0,e.s=void 0,V(e)}function et(e){if(c!==this)throw new Error("Out-of-order effect");H(this),c=e,this.f&=-2,8&this.f&&A(this),I()}function q(e){this.x=e,this.u=void 0,this.s=void 0,this.o=void 0,this.f=32}q.prototype.c=function(){var e=this.S();try{if(8&this.f||this.x===void 0)return;var t=this.x();typeof t=="function"&&(this.u=t)}finally{e()}};q.prototype.S=function(){1&this.f&&P(),this.f|=1,this.f&=-9,V(this),B(this),x++;var e=c;return c=this,et.bind(this,e)};q.prototype.N=function(){2&this.f||(this.f|=2,this.o=M,M=this)};q.prototype.d=function(){this.f|=8,1&this.f||A(this)};function J(e){var t=new q(e);try{t.c()}catch(s){throw t.d(),s}return t.d.bind(t)}function G(e){return e instanceof h}function st(e){return G(e)?e.value:e}let ot=class{constructor(){this.subscriptions=[]}get node(){return this._node}setTextContent(t){this._node.textContent=t}addClass(t){this._node.classList.add(t)}toggleClass(t,s){this._node.classList.toggle(t,s)}removeClass(t){this._node.classList.remove(t)}destroyChildren(){for(const t of this.children)t.destroy();this.children=[]}destroy(){this.destroyChildren(),this._node.remove(),this.unsubscribeAll()}toString(){return this._node.outerHTML}subscribe(t){this.subscriptions.push(t)}unsubscribeAll(){for(const t of this.subscriptions)t();this.subscriptions=[]}appendTo(t){t.append(this._node)}on(t,s){this._node.addEventListener(t,s)}off(t,s){this._node.removeEventListener(t,s)}setAttribute(t,s){this._node.setAttribute(t,s)}removeAttribute(t){this._node.removeAttribute(t)}applyStyle(t){for(const s in t)this._node.style[s]=t[s]||""}removeChild(t){this._node.removeChild(t.node),this.removeFromChildren(t)}removeFromChildren(t){this.children=this.children.filter(s=>s!==t)}};function it(e){return e!=null}let v=class y extends ot{constructor(t,...s){super(),this.children=[],this._node=document.createElement(t.tag??"div"),t.txt&&(t.textContent=t.txt),this.applyProps(t),t.style&&this.applyStyle(t.style),s.length>0&&this.appendChildren(s)}applyProps(t){const s=this._node;for(const[o,i]of Object.entries(t))if(!(o==="tag"||o==="tagName"||o==="txt"||o==="style"))if(G(i)){const r=i.subscribe(a=>{s[o]=a});this.subscriptions.push(r),s[o]=i.value}else s[o]=i}append(t){if(t instanceof y)this._node.append(t.node),this.children.push(t);else if(t instanceof h){const s=document.createComment("comment");this._node.append(s);let o=null;this.subscriptions.push(t.subscribe(i=>{if(i!==null){const r=i instanceof y;r&&this.children.push(i);const a=r?i.node:i;o!==null?(o instanceof y&&this.children.push(o),o.replaceWith(a)):s.replaceWith(a),o=i}else o!==null&&(o.replaceWith(s),o instanceof y&&this.removeFromChildren(o),o=null)}))}else this._node.append(t)}appendChildren(t){t.filter(it).forEach(s=>{this.append(s)})}replaceWith(t){this._node.replaceWith(t instanceof y?t.node:t)}};function nt(e,t,...s){const o=document.createElement(e);return t.textContent=t.txt,Object.assign(o,t),s.forEach(i=>o.append(i)),o}function _(e){return(t,...s)=>nt(e,t,...s)}function rt(e,t){return new v(e,...t??[])}function F(e){return(t,...s)=>rt({tag:e,...t},s)}const at=F("main"),g=F("div"),ct=F("button"),lt=_("header"),Q=_("h2"),ht=_("h3"),n=_("div"),W=_("a"),dt=_("span"),ut=_("img"),vt=_("input");function ft(e,t){e.textContent="",e.append(t instanceof v?t.node:t)}const pt="modulepreload",mt=function(e){return"/movie-app/"+e},z={},_t=function(t,s,o){let i=Promise.resolve();if(s&&s.length>0){const r=document.getElementsByTagName("link");i=Promise.all(s.map(a=>{if(a=mt(a),a in z)return;z[a]=!0;const u=a.endsWith(".css"),O=u?'[rel="stylesheet"]':"";if(!!o)for(let b=r.length-1;b>=0;b--){const k=r[b];if(k.href===a&&(!u||k.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${a}"]${O}`))return;const f=document.createElement("link");if(f.rel=u?"stylesheet":pt,u||(f.as="script",f.crossOrigin=""),f.href=a,document.head.appendChild(f),u)return new Promise((b,k)=>{f.addEventListener("load",b),f.addEventListener("error",()=>k(new Error(`Unable to preload CSS for ${a}`)))})}))}return i.then(()=>t()).catch(r=>{const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=r,window.dispatchEvent(a),!a.defaultPrevented)throw r})};function gt(e){return new Promise(t=>{setTimeout(t,e)})}class yt{constructor(t){d(this,"storageKeyPrefix");this.storageKeyPrefix=t}getStorageKey(t){return`${this.storageKeyPrefix}_${t}`}saveData(t,s){const o=this.getStorageKey(t.toString());localStorage.setItem(o,JSON.stringify(s))}getData(t){const s=this.getStorageKey(t.toString()),o=localStorage.getItem(s);return o?JSON.parse(o):null}}const xt=new yt("movie-app");class bt{constructor(t){this.localStorageService=t}async getMovies({page:t,limit:s},o){await gt(500);const i=this.getPersistentFavoriteMovies();return _t(()=>import("./movies-s7jDMuIN.js"),__vite__mapDeps([])).then(r=>{const a=o?r.movies.filter(u=>i.includes(u.kinopoiskId.toString())):r.movies;return{data:a.slice((t-1)*s,t*s).map(u=>({...u,isFavorite:i.includes(u.kinopoiskId.toString())})),total:a.length,hasMore:t*s<a.length}})}getPersistentFavoriteMovies(){return this.localStorageService.getData("favoriteMovies")||[]}updateFavoriteMovies(t){const s=this.getPersistentFavoriteMovies(),o=s.indexOf(t);o!==-1?s.splice(o,1):s.push(t),this.localStorageService.saveData("favoriteMovies",s)}}const wt=new bt(xt),St="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20552.85%20198.67'%3e%3ctitle%3ers_school%3c/title%3e%3cg%20data-name='Layer%202'%3e%3cg%20data-name='Layer%201'%3e%3cpath%20d='M275.36%2061.37l26.29-1.65q.86%206.41%203.48%209.76%204.28%205.43%2012.2%205.43%205.91%200%209.12-2.77a8.34%208.34%200%200%200%203.2-6.44%208.18%208.18%200%200%200-3-6.22q-3-2.74-14.15-5.19-18.18-4.08-25.93-10.86a21.84%2021.84%200%200%201-7.81-17.26%2023.44%2023.44%200%200%201%204-13%2026.47%2026.47%200%200%201%2012-9.64q8-3.51%2022-3.51%2017.14%200%2026.14%206.38t10.71%2020.28l-26.05%201.52q-1-6-4.36-8.78t-9.2-2.77c-3.21%200-5.63.69-7.25%202.05a6.25%206.25%200%200%200-2.44%205%205%205%200%200%200%202%203.84q1.95%201.77%209.27%203.3%2018.12%203.9%2026%207.9t11.4%209.91a25.12%2025.12%200%200%201%203.57%2013.24%2028.37%2028.37%200%200%201-4.75%2015.86%2029.83%2029.83%200%200%201-13.3%2011q-8.55%203.75-21.54%203.75-22.81%200-31.6-8.78t-10-22.35zM6.27%2091V1.53h46.06q12.81%200%2019.58%202.19a20.93%2020.93%200%200%201%2010.92%208.14A24.75%2024.75%200%200%201%2087%2026.35a24.8%2024.8%200%200%201-3.2%2012.84A24.91%2024.91%200%200%201%2075.07%2048a33.63%2033.63%200%200%201-9.7%203.54%2027.79%2027.79%200%200%201%207.19%203.29A27.79%2027.79%200%200%201%2077%2059.49%2035.16%2035.16%200%200%201%2080.85%2065l13.38%2026H63L48.24%2063.63q-2.81-5.31-5-6.9a11.63%2011.63%200%200%200-6.78-2.07H34V91zM34%2037.76h11.68A41%2041%200%200%200%2053%2036.54a7.3%207.3%200%200%200%204.48-2.81%208.24%208.24%200%200%200%201.74-5.18%208.23%208.23%200%200%200-2.75-6.65q-2.74-2.32-10.31-2.32H34zM0%20167.56l26.29-1.64q.86%206.41%203.48%209.76Q34%20181.11%2042%20181.11q5.91%200%209.12-2.78a8.34%208.34%200%200%200%203.2-6.44%208.2%208.2%200%200%200-3-6.22q-3-2.74-14.15-5.18-18.18-4.1-25.93-10.86a21.87%2021.87%200%200%201-7.81-17.27%2023.49%2023.49%200%200%201%204-13%2026.47%2026.47%200%200%201%2012-9.64q8-3.51%2022-3.51%2017.14%200%2026.14%206.38t10.71%2020.28l-26%201.53q-1-6-4.36-8.79t-9.19-2.74q-4.81%200-7.25%202a6.25%206.25%200%200%200-2.44%205%205%205%200%200%200%202%203.85q1.95%201.77%209.27%203.29%2018.12%203.9%2026%207.9t11.4%209.91a25.15%2025.15%200%200%201%203.57%2013.24%2028.35%2028.35%200%200%201-4.75%2015.86%2029.83%2029.83%200%200%201-13.3%2011q-8.55%203.75-21.54%203.75-22.81%200-31.6-8.78T0%20167.56zm163-7.01l24.22%207.32a44.72%2044.72%200%200%201-7.69%2017%2033.46%2033.46%200%200%201-13%2010.31q-7.78%203.47-19.8%203.47-14.58%200-23.82-4.23t-16-14.91q-6.72-10.67-6.71-27.31%200-22.18%2011.8-34.11t33.4-11.92q16.91%200%2026.57%206.84t14.36%2021l-24.4%205.43a21%2021%200%200%200-2.68-6%2016%2016%200%200%200-5.67-4.88%2016.31%2016.31%200%200%200-7.51-1.71q-9.39%200-14.39%207.56-3.8%205.61-3.79%2017.61%200%2014.86%204.52%2020.38t12.69%205.51q7.92%200%2012-4.45t5.9-12.91zm45.51-52.83h27.63V139h30.2v-31.28h27.75v89.43h-27.75V161h-30.2v36.18h-27.63zm102.78%2044.77q0-21.88%2012.2-34.1t34-12.2q22.32%200%2034.4%2012T404%20151.76q0%2015.69-5.28%2025.72a37.54%2037.54%200%200%201-15.25%2015.61q-10%205.58-24.86%205.58-15.12%200-25-4.82a37.59%2037.59%200%200%201-16.07-15.25q-6.26-10.42-6.25-26.11zm27.63.13q0%2013.55%205%2019.46t13.7%205.91q8.91%200%2013.79-5.79t4.88-20.8q0-12.63-5.1-18.46t-13.82-5.82A16.78%2016.78%200%200%200%20344%20133q-5.07%206-5.08%2019.62z'/%3e%3cpath%20d='M392.28%20152.49q0-21.88%2012.2-34.1t34-12.2q22.34%200%2034.41%2012t12.07%2033.58q0%2015.69-5.27%2025.72a37.6%2037.6%200%200%201-15.25%2015.61q-10%205.58-24.86%205.58-15.13%200-25-4.82a37.67%2037.67%200%200%201-16.08-15.25q-6.22-10.43-6.22-26.12zm27.64.13q0%2013.55%205%2019.46t13.72%205.92q8.91%200%2013.79-5.79t4.88-20.8q0-12.63-5.09-18.46t-13.82-5.82A16.77%2016.77%200%200%200%20425%20133q-5.09%206-5.08%2019.62z'/%3e%3cpath%20d='M482.08%20107.72h27.64v67.41h43.13v22h-70.77z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e",Nt="_header_1uvoz_1",Mt="_logo_1uvoz_9",qt="_title_1uvoz_17",kt="_link_1uvoz_28",$={header:Nt,logo:Mt,title:qt,link:kt},$t=()=>lt({className:$.header},W({href:"/movie-app/",className:$.link},Q({className:$.title,textContent:"Movie app"})),n({className:$.logo},W({href:"https://rs.school/js/",target:"_blank"},ut({src:St,alt:"rs-school-logo"})))),Ct="_button_1fval_1",Lt={button:Ct},E=({txt:e,onClick:t,className:s})=>ct({className:p(()=>`${Lt.button} ${st(s)||""}`),txt:e,onclick:o=>{o.preventDefault(),t==null||t()}}),Pt="_loader_1xq9m_1",Ot="_spin_1xq9m_1",Tt={loader:Pt,spin:Ot};class Et extends v{constructor(t){super({className:p(()=>t.value?"grey-modal":"")}),this.isLoading=t,this.append(g({className:p(()=>t.value?Tt.loader:"")}))}show(){this.isLoading.value=!0}hide(){this.isLoading.value=!1}}const It=e=>new Et(e),At="_content_1ucqx_1",Ft="_header_1ucqx_20",jt="_body_1ucqx_34",Wt="_footer_1ucqx_42",C={content:At,header:Ft,body:jt,footer:Wt};class zt extends v{constructor(s){super({className:"modal"});d(this,"resolve");d(this,"modalWrapper");d(this,"onOutsideClick",s=>{s.target===this.modalWrapper&&this.setResult(!1)});this.modalWrapper=n({className:"grey-modal",onclick:this.onOutsideClick}),this.appendChildren([this.modalWrapper,g({className:C.content},n({className:C.header},Q({txt:s.title})),s.description instanceof v?s.description:n({className:C.body,txt:s.description}),g({className:C.footer},E({txt:s.confirmText??"OK",onClick:()=>{this.setResult(!0)}}),s.declineText!=null?E({txt:s.declineText,onClick:()=>{this.setResult(!1)}}):null))])}open(s=document.body){return s.append(this.node),new Promise(o=>{this.resolve=o})}setResult(s){var o;(o=this.resolve)==null||o.call(this,s),this.destroy()}}const Dt=e=>new zt(e),Rt="_placeholder_1gpy3_1",D={placeholder:Rt},Y=({src:e="",alt:t="",className:s=""})=>{const o=new Image,i=g({className:D.placeholder},o);return o.src=e,o.alt=t,o.className=s,o.onload=()=>{i.removeClass(D.placeholder)},i},Ut="_card_1s2nb_1",Kt="_title_1s2nb_16",Bt="_poster_1s2nb_22",Ht="_link_1s2nb_27",Vt="_year_1s2nb_38",Jt="_genres_1s2nb_44",S={card:Ut,title:Kt,poster:Bt,link:Ht,year:Vt,genres:Jt},Gt=({movie:e,onClick:t})=>g({className:S.card,onclick:()=>{t()}},Y({src:e.posterUrlPreview,className:S.poster}),n({className:S.title,txt:e.nameRu}),n({className:S.year,txt:e.year.toString()}),n({className:S.genres,txt:e.genres.map(({genre:s})=>s).join(", ")})),Qt=(e,t)=>new v({...e,tag:"i",innerHTML:t}),Yt="_skeleton_ob281_1",Xt="_skeleton-loading_ob281_1",Zt="_skeleton-text_ob281_13",R={skeleton:Yt,"skeleton-loading":"_skeleton-loading_ob281_1",skeletonLoading:Xt,"skeleton-text":"_skeleton-text_ob281_13",skeletonText:Zt},te=()=>n({className:`${R.skeleton} ${R.skeletonText}`});class ee{constructor(){d(this,"observers",[])}subscribe(t){this.observers.push(t)}unsubscribe(t){const s=this.observers.indexOf(t);s!==-1&&this.observers.splice(s,1)}notifyAll(t){for(const s of this.observers)s.update(t)}unsubscribeAll(){this.observers.length=0}}class se extends ee{constructor(s){super();d(this,"intervalId");d(this,"timerInterval");if(s<=0)throw new Error("Timer interval should be greater than 0ms");this.timerInterval=s,this.start()}start(){this.intervalId&&clearInterval(this.intervalId),this.intervalId=window.setInterval(()=>{this.notifyAll(Date.now())},this.timerInterval)}pause(){this.intervalId&&(clearInterval(this.intervalId),this.intervalId=void 0)}stop(){this.pause(),this.unsubscribeAll()}}function oe(e){const t=Math.floor(e/1e3),s=Math.floor(t/60),o=Math.floor(s/60),i=Math.floor(o/24),r=Math.floor(i/30),a=t%60,u=s%60,O=o%24,j=i%30;return`${r} months, ${j} days, ${O} hours, ${u} minutes, ${a} seconds`}const ie="_timer_1rc9w_1",ne={timer:ie};class re extends v{constructor(s){super({className:ne.timer},te());d(this,"timerService",new se(1e3));this.premiereDate=s,this.timerService.subscribe(this)}update(s){if(this.premiereDate<=s)this.setTextContent("The premiere has started"),this.timerService.stop();else{const o=oe(this.premiereDate-s);this.setTextContent(o)}}destroy(){this.timerService.stop(),super.destroy()}}const ae=e=>new re(e),ce="_info_761ee_1",le="_title_761ee_14",he="_description_761ee_25",de="_poster_761ee_31",ue="_link_761ee_36",ve="_row_761ee_47",fe="_year_761ee_54",pe="_genres_761ee_55",me="_duration_761ee_56",_e="_countries_761ee_57",ge="_premiere_761ee_58",ye="_favorite-button_761ee_73",xe="_favorite_761ee_73",be="_wait-for-premiere_761ee_93",l={info:ce,title:le,description:he,poster:de,link:ue,row:ve,year:fe,genres:pe,duration:me,countries:_e,premiere:ge,"favorite-button":"_favorite-button_761ee_73",favoriteButton:ye,favorite:xe,"wait-for-premiere":"_wait-for-premiere_761ee_93",waitForPremiere:be};class we extends v{constructor({movie:t,onMakeFavorite:s,isFavorite:o}){o.subscribe(i=>{console.log("isFavorite",i)}),super({className:l.info},Y({src:t.posterUrlPreview,className:l.poster}),g({},ht({className:l.waitForPremiere,txt:"Wait for the premiere"}),ae(new Date(t.premiereRu).getTime())),n({className:l.description,txt:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sodales, ligula ornare sodales mattis, tellus lectus porttitor diam, vitae porta mi arcu ac nunc. Nam quam erat, aliquet at sodales id, consectetur a ligula. Mauris ut nunc sodales, efficitur neque eget, euismod massa."}),n({className:l.row},n({txt:"Year"}),n({className:l.year,txt:t.year.toString()})),n({className:l.row},n({txt:"Genres"}),n({className:l.genres,txt:t.genres.map(({genre:i})=>i).join(", ")})),n({className:l.row},n({txt:"Duration"}),n({className:l.duration,txt:`${t.duration}m`})),n({className:l.row},n({txt:"Countries"}),n({className:l.countries,txt:t.countries.map(({country:i})=>i).join(", ")})),n({className:l.row},n({txt:"Premiere"}),n({className:l.premiere,txt:t.premiereRu})),n({className:l.title,onclick:s},dt({txt:"Add to favorite"}),Qt({className:p(()=>`${l.favoriteButton} ${o.value&&l.favorite}`)},"&#x2605;").node))}}const Se=e=>new we(e),Ne="_movie-list_njx90_1",Me="_movie-list-page_njx90_8",qe="_title-container_njx90_11",ke="_title_njx90_11",$e="_favorite-switcher_njx90_22",N={"movie-list":"_movie-list_njx90_1",movieList:Ne,"movie-list-page":"_movie-list-page_njx90_8",movieListPage:Me,"title-container":"_title-container_njx90_11",titleContainer:qe,title:ke,"favorite-switcher":"_favorite-switcher_njx90_22",favoriteSwitcher:$e};class Ce extends v{constructor(s){super({className:N.movieListPage});d(this,"isLoading",w(!1));d(this,"paginationOptions",{page:1,limit:12});d(this,"hasMore",w(!1));d(this,"favoriteOnly",w(!1));d(this,"movies",w([]));this.movieService=s,J(()=>{this.paginationOptions.page=1,this.movies.value=[],this.loadMovies(this.favoriteOnly.value)}),this.appendChildren([n({className:N.titleContainer},n({className:N.title,txt:"Movies"}),n({className:N.favoriteSwitcher},n({txt:"Favorite only"}),vt({type:"checkbox",onchange:()=>{this.favoriteOnly.value=!this.favoriteOnly.value,this.paginationOptions.page=1,this.movies.value=[],this.loadMovies(this.favoriteOnly.value)}}))),p(()=>this.movies.value.length>0?g({className:N.movieList},...this.movies.value.map(o=>Gt({movie:o,onClick:()=>{this.showMovieModal(o)}}))):null),p(()=>this.isLoading?It(this.isLoading):null),p(()=>this.hasMore?E({txt:"Load more",onClick:()=>{this.paginationOptions.page++,this.loadMovies(this.favoriteOnly.value)},className:p(()=>this.hasMore.value?"":"hidden")}):null)])}async loadMovies(s){this.isLoading.value=!0;const{data:o,hasMore:i}=await this.movieService.getMovies(this.paginationOptions,s);this.isLoading.value=!1,this.movies.value=[...this.movies.value,...o],this.hasMore.value=i}showMovieModal(s){const o=w(s.isFavorite??!1),i=Se({movie:s,onMakeFavorite:()=>{this.movieService.updateFavoriteMovies(s.kinopoiskId.toString()),o.value=!o.value},isFavorite:o});Dt({title:s.nameRu,description:i}).open(this.node)}}const Le=e=>new Ce(e);class Pe extends v{constructor(){console.log("PageWrapperComponent"),super({className:"page-wrapper"},$t(),at({className:"main"},Le(wt)))}}const Oe=()=>new Pe;ft(document.querySelector("#app"),Oe());
function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = []
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}
