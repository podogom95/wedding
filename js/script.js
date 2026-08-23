history.scrollRestoration = "manual";

window.addEventListener("load", () => {
    window.scrollTo(0, 0);
});


// ==================================================
// 계좌번호 아코디언
// ==================================================

document.querySelectorAll('.accordion')
.forEach(btn => {

    btn.addEventListener('click', () => {

        const panel = btn.nextElementSibling;

        if (panel.style.display === 'block') {
            panel.style.display = 'none';
        } else {
            panel.style.display = 'block';
        }

    });

});


// ==================================================
// 계좌번호 복사
// ==================================================

function copyText(text) {

    navigator.clipboard.writeText(text);

}


// ==================================================
// 갤러리
// ==================================================

const galleryImages = Array.from(
    document.querySelectorAll('.gallery-img')
);

const galleryViewer = document.getElementById('galleryViewer');
const galleryViewerImg = document.getElementById('galleryViewerImg');

const prevButton = document.querySelector('.gallery-prev');
const nextButton = document.querySelector('.gallery-next');
const closeButton = document.querySelector('.gallery-close');

let currentIndex = 0;
let galleryOpen = false;

let touchStartX = 0;
let touchStartY = 0;

let ignoreClick = false;

let savedScrollY = 0;


// --------------------------------------------------
// 갤러리 열기
// --------------------------------------------------

function openGallery(index) {

    if (!galleryViewer || !galleryViewerImg) {
        return;
    }

    currentIndex = index;

    galleryViewerImg.src = galleryImages[currentIndex].src;

    galleryViewer.classList.add('active');

    galleryOpen = true;


    // 현재 스크롤 위치 저장
    savedScrollY = window.scrollY;


    // 배경 스크롤 방지
    document.body.classList.add('gallery-open');


    // 뒤로가기용 history 추가
    history.pushState(
        { gallery: true },
        "",
        window.location.href
    );

}


// --------------------------------------------------
// 갤러리 닫기
// --------------------------------------------------

function closeGallery() {

    if (!galleryViewer) {
        return;
    }

    galleryViewer.classList.remove('active');

    galleryOpen = false;

    document.body.classList.remove('gallery-open');


    // 기존 위치 복원
    window.scrollTo(0, savedScrollY);

}


// --------------------------------------------------
// 사진 변경
// --------------------------------------------------

function showImage(index, direction) {

    if (!galleryViewerImg || galleryImages.length === 0) {
        return;
    }


    // 마지막 → 첫 번째
    if (index >= galleryImages.length) {
        index = 0;
    }


    // 첫 번째 → 마지막
    if (index < 0) {
        index = galleryImages.length - 1;
    }


    // 기존 사진이 사라지는 방향
    if (direction === 'next') {

        galleryViewerImg.classList.add('fade-out-left');

    } else {

        galleryViewerImg.classList.add('fade-out-right');

    }


    setTimeout(() => {

        currentIndex = index;

        galleryViewerImg.src = galleryImages[currentIndex].src;


        // 기존 애니메이션 클래스 제거
        galleryViewerImg.classList.remove(
            'fade-out-left',
            'fade-out-right'
        );


        // 새 사진의 시작 위치
        if (direction === 'next') {

            galleryViewerImg.classList.add('fade-in-right');

        } else {

            galleryViewerImg.classList.add('fade-in-left');

        }


        // 브라우저가 위치를 적용한 다음
        // 원래 위치 + opacity 1로 전환
        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                galleryViewerImg.classList.remove(
                    'fade-in-left',
                    'fade-in-right'
                );

            });

        });

    }, 250);
}

// --------------------------------------------------
// 갤러리 사진 클릭
// --------------------------------------------------

galleryImages.forEach((img, index) => {

    img.addEventListener('click', () => {

        openGallery(index);

    });

});


// --------------------------------------------------
// 이전 사진
// --------------------------------------------------

if (prevButton) {

    prevButton.addEventListener('click', (e) => {

        e.stopPropagation();

        showImage(currentIndex - 1, 'prev');

    });

}


// --------------------------------------------------
// 다음 사진
// --------------------------------------------------

if (nextButton) {

    nextButton.addEventListener('click', (e) => {

        e.stopPropagation();

        showImage(currentIndex + 1, 'next');

    });

}


// --------------------------------------------------
// X 버튼
// --------------------------------------------------

if (closeButton) {

    closeButton.addEventListener('click', (e) => {

        e.stopPropagation();

        if (galleryOpen) {
            history.back();
        }

    });

}


// --------------------------------------------------
// 바깥 영역 클릭 → 닫기
// --------------------------------------------------

if (galleryViewer) {

    galleryViewer.addEventListener('click', (e) => {

        // 스와이프 직후 발생하는 click 방지
         if (ignoreClick) {
        return;
        }


        // 사진이 아닌 검은 배경을 클릭했을 때만 닫기
        if (e.target === galleryViewer) {

            if (galleryOpen) {
                history.back();
            }

        }

    });

}


// --------------------------------------------------
// 터치 시작
// --------------------------------------------------

if (galleryViewer) {

    galleryViewer.addEventListener('touchstart', (e) => {

        if (e.touches.length !== 1) {
            return;
        }


        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;

        isSwiping = false;

    }, { passive: true });

}


// --------------------------------------------------
// 터치 종료
// --------------------------------------------------

if (galleryViewer) {

    galleryViewer.addEventListener('touchend', (e) => {

        if (e.changedTouches.length !== 1) {
            return;
        }


        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;


        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;


        // 가로 방향으로 50px 이상 움직인 경우
        if (
            Math.abs(diffX) > 50 &&
            Math.abs(diffX) > Math.abs(diffY)
        ) {

            ignoreClick = true;


            // 왼쪽 스와이프 → 다음 사진
            if (diffX > 0) {

                showImage(currentIndex + 1,'next');

            }

            // 오른쪽 스와이프 → 이전 사진
            else {

                showImage(currentIndex - 1,'prev');

            }

            // 모바일 브라우저가 만들어내는 click만 무시
            setTimeout(() => {
                ignoreClick = false;
            }, 400);

        }

    }, { passive: true });

}


// --------------------------------------------------
// 브라우저 뒤로가기
// Android 뒤로가기
// iPhone Safari 뒤로가기 제스처
// --------------------------------------------------

window.addEventListener('popstate', () => {

    if (galleryOpen) {

        closeGallery();

    }

});


// ==================================================
// 카드 스크롤 애니메이션
// ==================================================

const observer = new IntersectionObserver(
    (entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                entry.target.classList.add('show');

            } else {

                entry.target.classList.remove('show');

            }

        });

    },
    {
        threshold: 0
    }
);


document.querySelectorAll('.card')
.forEach(el => observer.observe(el));
