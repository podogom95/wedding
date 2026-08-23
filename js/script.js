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

const galleryViewer =
    document.getElementById('galleryViewer');

const galleryViewerImg =
    document.getElementById('galleryViewerImg');

const galleryViewerImgNext =
    document.getElementById('galleryViewerImgNext');

const prevButton =
    document.querySelector('.gallery-prev');

const nextButton =
    document.querySelector('.gallery-next');

const closeButton =
    document.querySelector('.gallery-close');


let currentIndex = 0;
let galleryOpen = false;

let savedScrollY = 0;


// ==================================================
// 터치 상태
// ==================================================

let touchStartX = 0;
let touchCurrentX = 0;

let isDragging = false;
let isAnimating = false;


// ==================================================
// 갤러리 열기
// ==================================================

function openGallery(index) {

    if (!galleryViewer || !galleryViewerImg) {
        return;
    }

    currentIndex = index;

    galleryViewerImg.src =
        galleryImages[currentIndex].src;

    galleryViewerImgNext.src = "";

    galleryViewerImg.style.transform =
        "translateX(0)";

    galleryViewerImg.style.opacity =
        "1";

    galleryViewerImgNext.style.transform =
        "translateX(100%)";

    galleryViewerImgNext.style.opacity =
        "0";


    galleryViewer.classList.add('active');

    galleryOpen = true;


    savedScrollY = window.scrollY;

    document.body.classList.add('gallery-open');


    history.pushState(
        { gallery: true },
        "",
        window.location.href
    );

}


// ==================================================
// 갤러리 닫기
// ==================================================

function closeGallery() {

    if (!galleryViewer) {
        return;
    }

    galleryViewer.classList.remove('active');

    galleryOpen = false;

    isDragging = false;
    isAnimating = false;

    document.body.classList.remove('gallery-open');

    window.scrollTo(0, savedScrollY);

}


// ==================================================
// 사진 변경
// ==================================================

function showImage(index, direction) {

    if (isAnimating) {
        return;
    }

    if (galleryImages.length === 0) {
        return;
    }


    if (index >= galleryImages.length) {
        index = 0;
    }

    if (index < 0) {
        index = galleryImages.length - 1;
    }


    isAnimating = true;


    const width =
        galleryViewer.offsetWidth;


    // ----------------------------------------------
    // 다음 사진 준비
    // ----------------------------------------------

    galleryViewerImgNext.src =
        galleryImages[index].src;


    galleryViewerImgNext.style.opacity =
        "1";


    // 다음 사진 시작 위치
    if (direction === "next") {

        galleryViewerImgNext.style.transform =
            `translateX(${width}px)`;

    } else {

        galleryViewerImgNext.style.transform =
            `translateX(-${width}px)`;

    }


    galleryViewerImg.classList.add('animating');
    galleryViewerImgNext.classList.add('animating');


    // ----------------------------------------------
    // 이동 시작
    // ----------------------------------------------

    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            if (direction === "next") {

                galleryViewerImg.style.transform =
                    `translateX(-${width}px)`;

            } else {

                galleryViewerImg.style.transform =
                    `translateX(${width}px)`;

            }


            // 현재 사진 페이드아웃
            galleryViewerImg.style.opacity =
                "0.15";


            // 새 사진 페이드인
            galleryViewerImgNext.style.transform =
                "translateX(0)";

            galleryViewerImgNext.style.opacity =
                "1";

        });

    });


    // ----------------------------------------------
    // 애니메이션 종료
    // ----------------------------------------------

    setTimeout(() => {

        currentIndex = index;


        galleryViewerImg.src =
            galleryViewerImgNext.src;


        galleryViewerImg.style.transform =
            "translateX(0)";

        galleryViewerImg.style.opacity =
            "1";


        galleryViewerImgNext.style.transform =
            "translateX(100%)";

        galleryViewerImgNext.style.opacity =
            "0";


        galleryViewerImg.classList.remove(
            'animating'
        );

        galleryViewerImgNext.classList.remove(
            'animating'
        );


        isAnimating = false;

    }, 300);

}


// ==================================================
// 갤러리 사진 클릭
// ==================================================

galleryImages.forEach((img, index) => {

    img.addEventListener('click', () => {

        openGallery(index);

    });

});


// ==================================================
// 이전 버튼
// ==================================================

if (prevButton) {

    prevButton.addEventListener('click', (e) => {

        e.stopPropagation();

        if (!galleryOpen || isAnimating) {
            return;
        }

        showImage(
            currentIndex - 1,
            "prev"
        );

    });

}


// ==================================================
// 다음 버튼
// ==================================================

if (nextButton) {

    nextButton.addEventListener('click', (e) => {

        e.stopPropagation();

        if (!galleryOpen || isAnimating) {
            return;
        }

        showImage(
            currentIndex + 1,
            "next"
        );

    });

}


// ==================================================
// X 버튼
// ==================================================

if (closeButton) {

    closeButton.addEventListener('click', (e) => {

        e.stopPropagation();

        if (galleryOpen) {

            history.back();

        }

    });

}


// ==================================================
// 배경 클릭 → 닫기
// ==================================================

galleryViewer.addEventListener('click', (e) => {

    /*
       사진이나 버튼이 아니라
       진짜 검은 배경을 클릭했을 때만 닫음
    */

    if (e.target === galleryViewer) {

        if (galleryOpen) {

            history.back();

        }

    }

});


// ==================================================
// 터치 시작
// ==================================================

galleryViewer.addEventListener(
    'touchstart',
    (e) => {

        /*
           X / 이전 / 다음 버튼을 터치한 경우
           스와이프 로직을 실행하지 않음
        */

        if (
            e.target.closest('.gallery-close') ||
            e.target.closest('.gallery-prev') ||
            e.target.closest('.gallery-next')
        ) {

            return;

        }


        if (isAnimating) {
            return;
        }


        if (e.touches.length !== 1) {
            return;
        }


        touchStartX =
            e.touches[0].clientX;

        touchCurrentX =
            touchStartX;


        isDragging = true;


        // 애니메이션 제거
        galleryViewerImg.classList.remove(
            'animating'
        );

        galleryViewerImgNext.classList.remove(
            'animating'
        );

    },
    { passive: true }
);


// ==================================================
// 터치 이동
// ==================================================

galleryViewer.addEventListener(
    'touchmove',
    (e) => {

        if (!isDragging || isAnimating) {
            return;
        }


        if (e.touches.length !== 1) {
            return;
        }


        touchCurrentX =
            e.touches[0].clientX;


        const diff =
            touchCurrentX - touchStartX;


        const width =
            galleryViewer.offsetWidth;


        /*
           이동 범위 제한
        */

        const limitedDiff =
            Math.max(
                -width,
                Math.min(width, diff)
            );


        /*
           현재 사진 이동
        */

        galleryViewerImg.style.transform =
            `translateX(${limitedDiff}px)`;


        /*
           이동량에 따라 페이드

           중앙 = 1
           화면 절반 이동 = 약 0.5
           화면 끝 = 0
        */

        const progress =
            Math.min(
                Math.abs(limitedDiff) / width,
                1
            );


        const currentOpacity =
            1 - progress * 0.35;


        galleryViewerImg.style.opacity =
            currentOpacity;


        /*
           왼쪽 스와이프
           → 다음 사진
        */

        if (limitedDiff < 0) {

            const nextIndex =
                (currentIndex + 1) %
                galleryImages.length;


            galleryViewerImgNext.src =
                galleryImages[nextIndex].src;


            galleryViewerImgNext.style.transform =
                `translateX(${width + limitedDiff}px)`;


            /*
               다음 사진도 조금씩 나타남
            */

            galleryViewerImgNext.style.opacity =
                progress;

        }


        /*
           오른쪽 스와이프
           → 이전 사진
        */

        else if (limitedDiff > 0) {

            const prevIndex =
                (currentIndex - 1 +
                galleryImages.length) %
                galleryImages.length;


            galleryViewerImgNext.src =
                galleryImages[prevIndex].src;


            galleryViewerImgNext.style.transform =
                `translateX(${-width + limitedDiff}px)`;


            galleryViewerImgNext.style.opacity =
                progress;

        }

    },
    { passive: true }
);


// ==================================================
// 터치 종료
// ==================================================

galleryViewer.addEventListener(
    'touchend',
    () => {

        if (!isDragging || isAnimating) {
            return;
        }


        isDragging = false;


        const diff =
            touchCurrentX - touchStartX;


        const width =
            galleryViewer.offsetWidth;


        const threshold = 80;


        // ==========================================
        // 충분히 밀었음
        // ==========================================

        if (Math.abs(diff) > threshold) {


            if (diff < 0) {

                // 왼쪽 → 다음

                showImage(
                    currentIndex + 1,
                    "next"
                );

            } else {

                // 오른쪽 → 이전

                showImage(
                    currentIndex - 1,
                    "prev"
                );

            }

        }


        // ==========================================
        // 충분히 밀지 못함 → 원위치
        // ==========================================

        else {

            galleryViewerImg.classList.add(
                'animating'
            );

            galleryViewerImgNext.classList.add(
                'animating'
            );


            galleryViewerImg.style.transform =
                "translateX(0)";

            galleryViewerImg.style.opacity =
                "1";


            galleryViewerImgNext.style.transform =
                "translateX(100%)";

            galleryViewerImgNext.style.opacity =
                "0";


            setTimeout(() => {

                galleryViewerImg.classList.remove(
                    'animating'
                );

                galleryViewerImgNext.classList.remove(
                    'animating'
                );

            }, 280);

        }

    }
);


// ==================================================
// 브라우저 뒤로가기
// Android 뒤로가기
// iPhone Safari 뒤로가기 제스처
// ==================================================

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


// ==================================================
// 배경음악
// ==================================================

const bgm = document.getElementById('bgm');
const musicButton = document.getElementById('musicButton');

let musicPlaying = false;


// --------------------------------------------------
// 버튼 상태 업데이트
// --------------------------------------------------

function updateMusicButton() {

    if (!musicButton) {
        return;
    }

    if (musicPlaying) {

        musicButton.classList.add('playing');
        musicButton.textContent = '♪';

        musicButton.setAttribute(
            'aria-label',
            '배경음악 끄기'
        );

    } else {

        musicButton.classList.remove('playing');
        musicButton.textContent = '♫';

        musicButton.setAttribute(
            'aria-label',
            '배경음악 켜기'
        );

    }
}


// --------------------------------------------------
// 음악 재생
// --------------------------------------------------

function playMusic() {

    if (!bgm) {
        return;
    }


    // 오디오가 준비되지 않은 경우
    if (bgm.readyState === 0) {
        bgm.load();
    }


    const promise = bgm.play();


    if (promise !== undefined) {

        promise
            .then(() => {

                musicPlaying = true;

                updateMusicButton();

            })
            .catch((error) => {

                console.log(
                    'BGM 재생 실패:',
                    error
                );

                musicPlaying = false;

                updateMusicButton();

            });

    }

}


// --------------------------------------------------
// 음악 정지
// --------------------------------------------------

function pauseMusic() {

    if (!bgm) {
        return;
    }

    bgm.pause();

    musicPlaying = false;

    updateMusicButton();

}


// --------------------------------------------------
// 음악 버튼
// --------------------------------------------------

if (musicButton) {

    musicButton.addEventListener(
        'click',
        (e) => {

            e.stopPropagation();

            if (musicPlaying) {

                pauseMusic();

            } else {

                playMusic();

            }

        }
    );

}

// ==================================================
// 사용자 상호작용 → 음악 재생
// ==================================================

let interactionUsed = false;


function handleUserInteraction() {

    if (interactionUsed) {
        return;
    }


    if (musicPlaying) {
        interactionUsed = true;
        return;
    }


    playMusic();


    /*
       play()가 성공하면 다시 실행할 필요가 없으므로
       일단 interactionUsed를 바로 true로 만들지 않는다.

       Android에서 첫 이벤트가 play() 거부될 경우
       다음 이벤트에서 다시 시도할 수 있도록 한다.
    */

}

// ==================================================
// 페이지 스크롤 후 BGM 재생
// ==================================================

let hasScrolled = false;

window.addEventListener('scroll', () => {

    // 실제로 페이지가 이동했는지 확인
    if (window.scrollY > 0 && !hasScrolled) {

        hasScrolled = true;

        playMusic();

    }

}, { passive: true });
