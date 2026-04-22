export class Carousel {
    constructor(trackSelector, prevBtnSelector, nextBtnSelector, countSelector) {
        this.track = document.querySelector(trackSelector);
        this.prevBtn = document.querySelector(prevBtnSelector);
        this.nextBtn = document.querySelector(nextBtnSelector);
        this.countSpan = document.querySelector(countSelector);
        
        this.items = [];
        this.currentIdx = 0;
        
        this.initEvents();
    }

    setItems(items) {
        this.items = items;
        this.update(0);
    }

    update(newIdx) {
        if (this.items.length === 0) return;
        this.currentIdx = newIdx;

        if (this.countSpan) {
            this.countSpan.textContent = `${String(this.currentIdx + 1).padStart(2, '0')} / ${String(this.items.length).padStart(2, '0')}`;
        }

        this.items.forEach((item, i) => {
            item.className = "card carousel-item";
            if (i === this.currentIdx) {
                item.classList.add("active");
            } else if (i === this.currentIdx - 1 || (this.currentIdx === 0 && i === this.items.length - 1)) {
                item.classList.add("prev");
            } else if (i === this.currentIdx + 1 || (this.currentIdx === this.items.length - 1 && i === 0)) {
                item.classList.add("next");
            }
        });
    }

    next() {
        if (this.items.length === 0) return;
        this.update(this.currentIdx === this.items.length - 1 ? 0 : this.currentIdx + 1);
    }

    prev() {
        if (this.items.length === 0) return;
        this.update(this.currentIdx === 0 ? this.items.length - 1 : this.currentIdx - 1);
    }

    goTo(index) {
        this.update(index);
    }

    initEvents() {
        if (this.prevBtn) this.prevBtn.addEventListener("click", () => this.prev());
        if (this.nextBtn) this.nextBtn.addEventListener("click", () => this.next());

        let touchStartX = 0;
        let touchEndX = 0;

        if (this.track) {
            this.track.addEventListener('touchstart', e => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            this.track.addEventListener('touchend', e => {
                touchEndX = e.changedTouches[0].screenX;
                if (touchEndX < touchStartX - 40) this.next(); // Swipe left
                if (touchEndX > touchStartX + 40) this.prev(); // Swipe right
            }, { passive: true });
        }
    }
}
