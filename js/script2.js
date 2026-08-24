// ==================================================
// 초기 설정
// ==================================================

history.scrollRestoration = "manual";

window.addEventListener("load", () => {
    window.scrollTo(0, 0);
});


// ==================================================
// 계좌번호 아코디언
// ==================================================

document.querySelectorAll(".accordion").forEach(button => {

    button.addEventListener("click", () => {

        const panel = button.nextElementSibling;

        if (!panel) return;

        panel.style.display =
            panel.style.display === "block"
                ? "none"
                : "block";

    });

});


// ==================================================
// 계좌번호 복사
// ==================================================

function copyText(text) {

    navigator.clipboard.writeText(text)
        .then(() => {
            console.log("계좌번호 복사 완료");
        })
        .catch(error => {
            console.log("계좌번호 복사 실패:", error);
        });

}


// ==================================================
// 배경음악
// ==================================================

const bgm = document.getElementById("bgm");
const musicButton = document.getElementById("musicButton");

let musicStarted = false;


// --------------------------------------------------
// 음악 재생
// --------------------------------------------------

function playMusic() {

    if (!bgm || musicStarted) return;

    bgm.play()
        .then(() => {

            musicStarted = true;

            if (musicButton) {
                musicButton.classList.add("playing");
            }

            console.log("BGM 재생");

        })
        .catch(error => {

            console.log("BGM 재생 실패:", error);

        });

}


// --------------------------------------------------
// 음악 정지
// --------------------------------------------------

function pauseMusic() {

    if (!bgm) return;

    bgm.pause();

    if (musicButton) {
        musicButton.classList.remove("playing");
    }

    console.log("BGM 정지");

}


// --------------------------------------------------
// 음악 버튼
// --------------------------------------------------

if (musicButton && bgm) {

    musicButton.addEventListener("click", event => {

        event.stopPropagation();

        if (bgm.paused) {
            playMusic();
        } else {
            pauseMusic();
        }

    });

}


// ==================================================
// 첫 사용자 동작 → 음악 시작
// ==================================================

function startMusicFromUserInteraction() {

    if (!bgm || musicStarted) return;

    playMusic();

}


// --------------------------------------------------
// 모바일
// 화면을 터치하거나 스크롤을 시작하는 순간
// --------------------------------------------------

document.addEventListener(
    "touchstart",
    startMusicFromUserInteraction,
    {
        passive: true
    }
);


// --------------------------------------------------
// PC
// --------------------------------------------------

document.addEventListener(
    "pointerdown",
    startMusicFromUserInteraction
);


// ==================================================
// 갤러리
// ==================================================

const galleryImages = Array.from(
    document.querySelectorAll(".gallery-img")
);

const galleryViewer =
    document.getElementById("galleryViewer");

const galleryViewerImg =
    document.getElementById("galleryViewerImg");

const galleryViewerImgNext =
    document.getElementById("galleryViewerImgNext");

const prevButton =
    document.querySelector(".gallery-prev");

const nextButton =
    document.querySelector(".gallery-next");

const closeButton =
    document.querySelector(".gallery-close");


let currentIndex = 0;
let galleryOpen = false;

let savedScrollY = 0;

let isAnimating = false;

let isDragging = false;

let touchStartX = 0;
let touchCurrentX = 0;

let ignoreClick = false;


// ==================================================
// 갤러리 열기
// ==================================================

function openGallery(index) {

    if (
        !galleryViewer ||
        !galleryViewerImg ||
        galleryImages.length === 0
    ) {
        return;
    }

    currentIndex = index;

    galleryViewerImg.src =
        galleryImages[currentIndex].dataset.full;

    galleryViewerImgNext.src = "";

    galleryViewerImg.style.transform =
        "translateX(0)";

    galleryViewerImg.style.opacity = "1";

    galleryViewerImgNext.style.transform =
        "translateX(0)";

    galleryViewerImgNext.style.opacity = "0";

    galleryViewer.classList.add("active");

    galleryOpen = true;

    savedScrollY = window.scrollY;

    document.body.classList.add("gallery-open");


    // Android / iPhone 뒤로가기 처리
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

    if (!galleryViewer) return;

    galleryViewer.classList.remove("active");

    galleryOpen = false;

    document.body.classList.remove("gallery-open");

    window.scrollTo(0, savedScrollY);

}


// ==================================================
// 사진 변경
// ==================================================

function showImage(index, direction) {

    if (
        isAnimating ||
        galleryImages.length === 0 ||
        !galleryViewerImg ||
        !galleryViewerImgNext
    ) {
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


    isAnimating = true;


    const width =
        galleryViewer.offsetWidth;


    // 다음 사진 준비
    galleryViewerImgNext.src =
        galleryImages[index].dataset.full;


    galleryViewerImg.classList.add("animating");
    galleryViewerImgNext.classList.add("animating");


    // --------------------------------------------------
    // 다음 사진
    // --------------------------------------------------

    if (direction === "next") {

        galleryViewerImgNext.style.transform =
            `translateX(${width}px)`;

    }

    // --------------------------------------------------
    // 이전 사진
    // --------------------------------------------------

    else {

        galleryViewerImgNext.style.transform =
            `translateX(-${width}px)`;

    }


    galleryViewerImgNext.style.opacity = "1";


    // 브라우저가 위치를 인식한 후 애니메이션 시작
    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            if (direction === "next") {

                galleryViewerImg.style.transform =
                    `translateX(-${width}px)`;

            } else {

                galleryViewerImg.style.transform =
                    `translateX(${width}px)`;

            }

            galleryViewerImg.style.opacity = "0";

            galleryViewerImgNext.style.transform =
                "translateX(0)";

        });

    });


    // CSS transition 시간과 맞춤
    setTimeout(() => {

        currentIndex = index;


        galleryViewerImg.src =
            galleryViewerImgNext.src;


        galleryViewerImg.style.transform =
            "translateX(0)";

        galleryViewerImg.style.opacity =
            "1";


        galleryViewerImgNext.style.transform =
            "translateX(0)";

        galleryViewerImgNext.style.opacity =
            "0";


        galleryViewerImg.classList.remove("animating");
        galleryViewerImgNext.classList.remove("animating");


        isAnimating = false;

    }, 650);

}


// ==================================================
// 갤러리 썸네일 클릭
// ==================================================

galleryImages.forEach((image, index) => {

    image.addEventListener("click", () => {

        openGallery(index);

    });

});


// ==================================================
// 이전 버튼
// ==================================================

if (prevButton) {

    prevButton.addEventListener("click", event => {

        event.stopPropagation();

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

    nextButton.addEventListener("click", event => {

        event.stopPropagation();

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

    closeButton.addEventListener("click", event => {

        event.stopPropagation();

        if (galleryOpen) {
            history.back();
        }

    });

}


// ==================================================
// 갤러리 바깥 영역 클릭 → 닫기
// ==================================================

if (galleryViewer) {

    galleryViewer.addEventListener("click", event => {

        if (ignoreClick) {
            return;
        }


        if (event.target === galleryViewer) {

            if (galleryOpen) {
                history.back();
            }

        }

    });

}


// ==================================================
// 터치 시작
// ==================================================

if (galleryViewer) {

    galleryViewer.addEventListener(
        "touchstart",
        event => {

            if (isAnimating) {
                return;
            }

            if (event.touches.length !== 1) {
                return;
            }


            touchStartX =
                event.touches[0].clientX;

            touchCurrentX =
                touchStartX;

            isDragging = true;


            galleryViewerImg.classList.remove(
                "animating"
            );

            galleryViewerImgNext.classList.remove(
                "animating"
            );

        },
        { passive: true }
    );

}


// ==================================================
// 터치 이동
// ==================================================

if (galleryViewer) {

    galleryViewer.addEventListener(
        "touchmove",
        event => {

            if (
                !isDragging ||
                isAnimating ||
                event.touches.length !== 1
            ) {
                return;
            }


            touchCurrentX =
                event.touches[0].clientX;


            const diff =
                touchCurrentX - touchStartX;


            const width =
                galleryViewer.offsetWidth;


            const limitedDiff =
                Math.max(
                    -width * 0.8,
                    Math.min(
                        width * 0.8,
                        diff
                    )
                );


            // 현재 사진 이동
            galleryViewerImg.style.transform =
                `translateX(${limitedDiff}px)`;


            // --------------------------------------------------
            // 왼쪽으로 스와이프
            // --------------------------------------------------

            if (limitedDiff < 0) {

                const nextIndex =
                    (currentIndex + 1) %
                    galleryImages.length;


                if (
                    galleryViewerImgNext.src !==
                        galleryImages[nextIndex].dataset.full
                ) {
                    galleryViewerImgNext.src =
                        galleryImages[nextIndex].dataset.full;
                }


                galleryViewerImgNext.style.transform =
                    `translateX(${width + limitedDiff}px)`;

            }


            // --------------------------------------------------
            // 오른쪽으로 스와이프
            // --------------------------------------------------

            else {

                const prevIndex =
                    (
                        currentIndex -
                        1 +
                        galleryImages.length
                    ) %
                    galleryImages.length;


                if (                
                    galleryViewerImgNext.src !==
                        galleryImages[prevIndex].dataset.full
                ) {
                    galleryViewerImgNext.src =
                        galleryImages[prevIndex].dataset.full;
                }


                galleryViewerImgNext.style.transform =
                    `translateX(${-width + limitedDiff}px)`;

            }

        },
        { passive: true }
    );

}


// ==================================================
// 터치 종료
// ==================================================

if (galleryViewer) {

    galleryViewer.addEventListener(
        "touchend",
        () => {

            if (!isDragging || isAnimating) {
                return;
            }


            isDragging = false;


            const diff =
                touchCurrentX - touchStartX;


            const threshold = 80;


            // --------------------------------------------------
            // 실제 스와이프
            // --------------------------------------------------

            if (Math.abs(diff) > threshold) {

                ignoreClick = true;


                if (diff < 0) {

                    showImage(
                        currentIndex + 1,
                        "next"
                    );

                } else {

                    showImage(
                        currentIndex - 1,
                        "prev"
                    );

                }


                // 스와이프 직후 발생하는 click 방지
                setTimeout(() => {

                    ignoreClick = false;

                }, 700);

            }


            // --------------------------------------------------
            // 짧은 터치 → 원래 위치
            // --------------------------------------------------

            else {

                galleryViewerImg.classList.add(
                    "animating"
                );

                galleryViewerImgNext.classList.add(
                    "animating"
                );


                galleryViewerImg.style.transform =
                    "translateX(0)";


                galleryViewerImgNext.style.transform =
                    "translateX(0)";

                galleryViewerImgNext.style.opacity =
                    "0";


                setTimeout(() => {

                    galleryViewerImg.classList.remove(
                        "animating"
                    );

                    galleryViewerImgNext.classList.remove(
                        "animating"
                    );

                }, 650);

            }

        }
    );

}


// ==================================================
// 브라우저 뒤로가기
// Android 뒤로가기
// iPhone Safari 뒤로가기 제스처
// ==================================================

window.addEventListener("popstate", () => {

    if (galleryOpen) {

        closeGallery();

    }

});


// ==================================================
// 카드 등장 애니메이션
// ==================================================

const observer =
    new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("show");

                } else {

                    entry.target.classList.remove("show");

                }

            });

        },
        {
            threshold: 0
        }
    );


document.querySelectorAll(".card")
    .forEach(element => {

        observer.observe(element);

    });
