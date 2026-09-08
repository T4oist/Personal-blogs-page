import { navigate } from 'astro:transitions/client';
import { setupMotion } from './motion';

let pageEvents: AbortController | undefined;
let toastTimer: ReturnType<typeof setTimeout>;
function toast(message: string) {
  const output = document.getElementById('toast');
  if (!output) return;
  output.textContent = message;
  output.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => output.classList.remove('visible'), 2800);
}

function setup() {
  pageEvents?.abort();
  pageEvents = new AbortController();
  const { signal } = pageEvents;
  setupMotion(signal);
  const dialog = document.querySelector<HTMLDialogElement>('#explorer');
  const search = document.querySelector<HTMLInputElement>('#global-search');
  const results = Array.from(document.querySelectorAll<HTMLAnchorElement>('.search-result'));
  let returnFocus: HTMLElement | null = null;
  const filterSearch = () => {
    const terms = (search?.value || '').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    for (const result of results) result.hidden = !terms.every(term => (result.dataset.search || '').toLocaleLowerCase().includes(term));
    const count = results.filter(result => !result.hidden).length;
    const empty = document.getElementById('search-empty');
    if (empty) empty.hidden = count > 0;
    const status = document.getElementById('search-count');
    if (status) status.textContent = `${count}`;
  };
  const openSearch = () => {
    if (!dialog || !search || dialog.open) return;
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    search.value = '';
    filterSearch();
    dialog.showModal();
    search.focus();
  };
  document.querySelectorAll('[data-open-search]').forEach(button => button.addEventListener('click', openSearch, {signal}));
  document.querySelector('[data-close-search]')?.addEventListener('click', () => dialog?.close(), {signal});
  search?.addEventListener('input', filterSearch, {signal});
  dialog?.addEventListener('close', () => returnFocus?.focus(), {signal});
  dialog?.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    if (event.target instanceof Element && event.target.closest('a')) dialog.close();
  }, {signal});
  document.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      dialog?.open ? dialog.close() : openSearch();
    }
    if (!dialog?.open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      dialog.close();
      return;
    }
    const visible = results.filter(result => !result.hidden);
    const index = visible.indexOf(document.activeElement as HTMLAnchorElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const next = event.key === 'ArrowDown' ? (index + 1) % visible.length : index <= 0 ? visible.length - 1 : index - 1;
      visible[next]?.focus();
    }
    if (event.key === 'Enter' && document.activeElement === search && visible[0]) {
      event.preventDefault();
      visible[0].click();
    }
  }, {signal});

  document.querySelectorAll<HTMLElement>('[data-filter-list]').forEach(list => {
    const buttons = Array.from(list.querySelectorAll<HTMLButtonElement>('[data-filter]'));
    const items = Array.from(list.querySelectorAll<HTMLElement>('[data-filter-item]'));
    const query = list.querySelector<HTMLInputElement>('[data-filter-query]');
    const sort = list.querySelector<HTMLSelectElement>('[data-sort]');
    const param = list.dataset.param || 'tag';
    const params = new URLSearchParams(location.search);
    let selected = params.get(param) || 'all';
    if (query) query.value = params.get('q') || '';
    if (sort) sort.value = params.get('sort') === 'oldest' ? 'oldest' : 'newest';
    const render = (syncUrl = true) => {
      const terms = (query?.value || '').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
      let count = 0;
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === selected)));
      items.forEach(item => {
        const topics: string[] = JSON.parse(item.dataset.topics || '[]');
        item.hidden = !(selected === 'all' || topics.includes(selected)) || !terms.every(term => (item.dataset.search || '').toLocaleLowerCase().includes(term));
        if (!item.hidden) count++;
      });
      const empty = list.querySelector<HTMLElement>('.filter-empty');
      if (empty) empty.hidden = count !== 0;
      const status = list.querySelector('.filter-count');
      if (status) status.textContent = `${count} / ${items.length}`;
      const container = list.querySelector('[data-sort-container]');
      if (container && sort) items.sort((a,b) => (Number(b.dataset.date) - Number(a.dataset.date)) * (sort.value === 'oldest' ? -1 : 1)).forEach(item => container.append(item));
      if (syncUrl) {
        const url = new URL(location.href);
        selected === 'all' ? url.searchParams.delete(param) : url.searchParams.set(param, selected);
        query?.value ? url.searchParams.set('q', query.value) : url.searchParams.delete('q');
        sort?.value === 'oldest' ? url.searchParams.set('sort','oldest') : url.searchParams.delete('sort');
        history.replaceState(history.state, '', url);
      }
    };
    buttons.forEach(button => button.addEventListener('click', () => { selected = button.dataset.filter || 'all'; render(); }, {signal}));
    query?.addEventListener('input', () => render(), {signal});
    sort?.addEventListener('change', () => render(), {signal});
    list.querySelector('[data-reset-filter]')?.addEventListener('click', () => { selected = 'all'; if(query) query.value = ''; render(); }, {signal});
    render(false);
  });

  document.querySelectorAll('[data-random-post]').forEach(button => button.addEventListener('click', () => {
    const posts = results.filter(result => result.getAttribute('href')?.startsWith('/blog/'));
    if (posts.length) navigate(posts[Math.floor(Math.random() * posts.length)].href);
    else toast('还没有文章，先去看看作品吧。');
  }, {signal}));
  document.querySelectorAll<HTMLElement>('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(button.dataset.copy || ''); toast('Copied.'); }
    catch { toast('复制失败，请手动复制邮箱。'); }
  }, {signal}));

  const letter = document.querySelector<HTMLElement>('[data-contact-letter]');
  if (letter) {
    const subject = letter.querySelector<HTMLInputElement>('#contact-subject')!;
    const message = letter.querySelector<HTMLTextAreaElement>('#contact-message')!;
    const email = letter.querySelector<HTMLAnchorElement>('[data-contact-email]')!;
    const topics = Array.from(letter.querySelectorAll<HTMLButtonElement>('[data-contact-topic]'));
    const syncEmail = () => {
      email.href = (email.dataset.address || '') + '?subject=' + encodeURIComponent(subject.value)
        + (message.value ? '&body=' + encodeURIComponent(message.value) : '');
    };
    topics.forEach(button => button.addEventListener('click', () => {
      topics.forEach(topic => topic.setAttribute('aria-pressed', String(topic === button)));
      subject.value = button.dataset.subject || '';
      letter.querySelector('[data-topic-symbol]')!.textContent = button.dataset.symbol || '';
      syncEmail();
    }, {signal}));
    subject.addEventListener('input', () => {
      topics.forEach(topic => topic.setAttribute('aria-pressed', String(topic.dataset.subject === subject.value)));
      syncEmail();
    }, {signal});
    message.addEventListener('input', syncEmail, {signal});
    syncEmail();
  }

  const article = document.querySelector<HTMLElement>('#reading-content');
  if (article) {
    const progress = document.querySelector<HTMLProgressElement>('#reading-progress');
    const updateProgress = () => {
      const rect = article.getBoundingClientRect();
      const distance = rect.height - window.innerHeight + 140;
      if (progress) progress.value = distance > 0 ? Math.min(100, Math.max(0, (100-rect.top)/distance*100)) : rect.top < window.innerHeight ? 100 : 0;
    };
    window.addEventListener('scroll', updateProgress, {signal, passive:true});
    window.addEventListener('resize', updateProgress, {signal});
    updateProgress();
    document.querySelector<HTMLButtonElement>('[data-reading-size]')?.addEventListener('click', event => {
      const large = article.classList.toggle('large-type');
      (event.currentTarget as HTMLButtonElement).setAttribute('aria-pressed', String(large));
      updateProgress();
    }, {signal});
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-toc]'));
    const headings = Array.from(article.querySelectorAll<HTMLElement>('h2[id], h3[id]'));
    const updateToc = () => {
      const current = headings.filter(heading => heading.getBoundingClientRect().top <= 180).at(-1) || headings[0];
      links.forEach(link => current && decodeURIComponent(link.hash.slice(1)) === current.id ? link.setAttribute('aria-current','location') : link.removeAttribute('aria-current'));
    };
    window.addEventListener('scroll', updateToc, {signal,passive:true});
    updateToc();
  }
}
document.addEventListener('astro:page-load', setup);
document.addEventListener('astro:before-swap', () => { pageEvents?.abort(); clearTimeout(toastTimer); });
