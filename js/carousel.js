export class Carousel {
    static TRANSITION_DURATION = 500;
    static SWIPE_THRESHOLD = 80;

    constructor(trackSelector, prevBtnSelector, nextBtnSelector, countSelector) {
        this.track = document.querySelector(trackSelector);
        this.prevBtn = document.querySelector(prevBtnSelector);
        this.nextBtn = document.querySelector(nextBtnSelector);
        this.countSpan = document.querySelector(countSelector);

        this.items = [];
        this.currentIdx = 0;
        this.transitioning = false;

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
            let cls = "card carousel-item";
            if (i === this.currentIdx) cls += " active";
            else if (i === this.currentIdx - 1 || (this.currentIdx === 0 && i === this.items.length - 1)) cls += " prev";
            else if (i === this.currentIdx + 1 || (this.currentIdx === this.items.length - 1 && i === 0)) cls += " next";
            item.className = cls;
        });
    }

    _navigate(nextIdx) {
        if (this.items.length === 0 || this.transitioning) return;
        this.transitioning = true;
        this.update(nextIdx);

        const activeItem = this.items[this.currentIdx];
        let done = false;
        const unlock = () => {
            if (done) return;
            done = true;
            this.transitioning = false;
        };
        activeItem.addEventListener('transitionend', unlock, { once: true });
        setTimeout(unlock, Carousel.TRANSITION_DURATION + 50);
    }

    next() {
        this._navigate(this.currentIdx === this.items.length - 1 ? 0 : this.currentIdx + 1);
    }

    prev() {
        this._navigate(this.currentIdx === 0 ? this.items.length - 1 : this.currentIdx - 1);
    }

    goTo(index) {
        this._navigate(index);
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
                if (touchEndX < touchStartX - Carousel.SWIPE_THRESHOLD) this.next();
                if (touchEndX > touchStartX + Carousel.SWIPE_THRESHOLD) this.prev();
            }, { passive: true });
        }
    }
}
