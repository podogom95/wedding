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
// 예식 날짜
// ==================================================

const weddingDate = new Date("2026-08-05T17:00:00+09:00");

// ==================================================
// 서버 시간 오프셋 계산
// ==================================================

let serverOffset = 0;

async function syncServerTime() {

    const clientBefore = Date.now();

    const response = await fetch(window.location.href, {
        method: "HEAD",
        cache: "no-store"
    });

    const clientAfter = Date.now();

    const serverDate = response.headers.get("date");

    if (!serverDate) return;

    const serverTime = new Date(serverDate).getTime();

    serverOffset =
        serverTime -
        ((clientBefore + clientAfter) / 2);
}

// ==================================================
// 현재 서버시간 반환
// ==================================================

function getServerNow() {
    return Date.now() + serverOffset;
}

// ==================================================
// 카운트다운
// ==================================================

function updateCountdown() {

    const diff = weddingDate.getTime() - getServerNow();

    if (diff <= 0) {

        document.getElementById("countdown").innerHTML =
            "저희 결혼했습니다! 축해해주셔서 감사합니다 :)";

        return;
    }

    const days =
        Math.floor(diff / (1000 * 60 * 60 * 24));

    const hours =
        Math.floor(diff / (1000 * 60 * 60)) % 24;

    const minutes =
        Math.floor(diff / (1000 * 60)) % 60;

    const seconds =
        Math.floor(diff / 1000) % 60;

    document.getElementById("days").textContent =
        days;

    document.getElementById("hours").textContent =
        String(hours).padStart(2, "0");

    document.getElementById("minutes").textContent =
        String(minutes).padStart(2, "0");

    document.getElementById("seconds").textContent =
        String(seconds).padStart(2, "0");
}

// ==================================================
// 시작
// ==================================================

async function startCountdown() {

    await syncServerTime();

    updateCountdown();

    setInterval(updateCountdown, 1000);
}

startCountdown();


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


// ==================================================
// 원본 이미지 캐시
// ==================================================

const imageCache = new Map();


// ==================================================
// 원본 이미지 preload + decode
// ==================================================

function preloadImage(index) {

    if (
        index < 0 ||
        index >= galleryImages.length
    ) {
        return Promise.resolve(null);
    }

    const src =
        galleryImages[index].dataset.full;


    // 이미 캐시에 있으면 기존 Promise 반환

    if (imageCache.has(src)) {

        return imageCache.get(src).promise;

    }


    const img = new Image();

    img.src = src;


    const promise =
        img.decode
            ? img.decode().catch(() => {})
            : new Promise(resolve => {

                if (img.complete) {

                    resolve();

                } else {

                    img.onload = resolve;
                    img.onerror = resolve;

                }

            });


    imageCache.set(src, {
        img: img,
        promise: promise
    });


    return promise;

}


let isDragging = false;

let touchStartX = 0;
let touchStartY = 0;

let touchCurrentX = 0;
let touchCurrentY = 0;

let ignoreClick = false;


// 스와이프 중 현재 이미지 이동 거리

let swipeCurrentX = 0;


// ==================================================
// 확대 / 축소
// ==================================================

let scale = 1;

const MIN_SCALE = 1;
const MAX_SCALE = 3;

let translateX = 0;
let translateY = 0;


// 핀치 시작 시점

let pinchStartDistance = 0;
let pinchStartScale = 1;


// --------------------------------------------------
// 핀치 기준점
// --------------------------------------------------

// 두 손가락 사이의 화면상 중심점
let pinchCenterX = 0;
let pinchCenterY = 0;

// 핀치 시작 당시 중심점에 대응하는
// 이미지 내부의 위치
let pinchLocalX = 0;
let pinchLocalY = 0;


// 실제로 핀치 동작을 했는지 여부

let wasPinching = false;


// 확대 상태에서 한 손가락 이동 시작 위치

let panStartX = 0;
let panStartY = 0;

let panStartTranslateX = 0;
let panStartTranslateY = 0;


// ==================================================
// 이미지 transform 적용
// ==================================================

function updateImageTransform() {

    if (!galleryViewerImg) return;

    galleryViewerImg.style.transform =
        `translate(${translateX}px, ${translateY}px) scale(${scale})`;

}


// ==================================================
// 확대 상태 초기화
// ==================================================

function resetZoom() {

    scale = 1;

    translateX = 0;
    translateY = 0;

    pinchStartDistance = 0;
    pinchStartScale = 1;

    panStartX = 0;
    panStartY = 0;

    panStartTranslateX = 0;
    panStartTranslateY = 0;


    if (galleryViewerImg) {

        galleryViewerImg.style.transform =
            "translate(0, 0) scale(1)";

        galleryViewerImg.style.transformOrigin =
            "center center";

    }

}


// ==================================================
// 확대 축소 후 이미지 중앙 정렬
// ==================================================

function centerImage() {

    if (!galleryViewerImg) return;


    // --------------------------------------------------
    // 현재 확대 상태 저장
    // --------------------------------------------------

    const currentScale = scale;

    const currentTranslateX = translateX;
    const currentTranslateY = translateY;


    // --------------------------------------------------
    // 보정된 현재 위치를 먼저 적용
    // --------------------------------------------------

    galleryViewerImg.classList.remove(
        "animating"
    );

    galleryViewerImg.style.transform =
        `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;


    // --------------------------------------------------
    // 브라우저가 현재 위치를 적용하도록 한 프레임 대기
    // --------------------------------------------------

    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            galleryViewerImg.classList.add(
                "zoom-reset"
            );


            // --------------------------------------------------
            // 최종 목표
            // --------------------------------------------------

            scale = 1;

            translateX = 0;
            translateY = 0;

            galleryViewerImg.style.transform =
                "translate(0px, 0px) scale(1)";


            // --------------------------------------------------
            // 애니메이션 종료
            // --------------------------------------------------

            setTimeout(() => {

                galleryViewerImg.classList.remove(
                    "zoom-reset"
                );

            }, 300);

        });

    });

}


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

    const currentSrc =
        galleryImages[currentIndex].dataset.full;


    galleryViewerImg.src = currentSrc;

    galleryViewerImgNext.src = "";

    resetZoom();

    galleryViewerImg.style.opacity = "1";

    galleryViewerImgNext.style.transform =
        "translateX(0)";

    galleryViewerImgNext.style.opacity = "0";

    galleryViewer.classList.add("active");

    galleryOpen = true;

    savedScrollY = window.scrollY;

    document.body.classList.add("gallery-open");

    preloadNearbyImages(currentIndex);


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
// 현재 이미지 주변 5장 preload
// 현재 + 앞 2장 + 뒤 2장
// ==================================================

function preloadNearbyImages(index) {

    const total =
        galleryImages.length;

    if (total === 0) {
        return;
    }


    const KEEP_RANGE = 2;

    const keepIndexes = new Set();


    // ------------------------------------------
    // 현재 이미지 기준 앞뒤 2장
    // ------------------------------------------

    for (
        let offset = -KEEP_RANGE;
        offset <= KEEP_RANGE;
        offset++
    ) {

        const targetIndex =
            (index + offset + total) % total;

        keepIndexes.add(targetIndex);

        preloadImage(targetIndex);

    }


    // ------------------------------------------
    // 범위를 벗어난 이미지 캐시 제거
    // ------------------------------------------

    for (const [src, cache] of imageCache) {

        const cacheIndex =
            galleryImages.findIndex(
                image =>
                    image.dataset.full === src
            );


        if (
            cacheIndex !== -1 &&
            !keepIndexes.has(cacheIndex)
        ) {

            imageCache.delete(src);

        }

    }

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

    const nextSrc =
        galleryImages[index].dataset.full;


    preloadImage(index);


    // 다음 이미지 준비

    galleryViewerImgNext.src = nextSrc;

    galleryViewerImg.classList.add("animating");
    galleryViewerImgNext.classList.add("animating");

    galleryViewerImgNext.style.opacity = "1";


    // 현재 사진만 슬라이드

    if (direction === "next") {

        galleryViewerImg.style.transform =
            `translate3d(-${width}px, 0, 0)`;

    } else {

        galleryViewerImg.style.transform =
            `translate3d(${width}px, 0, 0)`;

    }


    // 다음 사진은 중앙에 고정

    galleryViewerImgNext.style.transform =
        "translate3d(0, 0, 0)";


    setTimeout(() => {

        currentIndex = index;

        galleryViewerImg.src =
            galleryViewerImgNext.src;

        galleryViewerImg.style.transform =
            "translateX(0)";

        galleryViewerImgNext.style.transform =
            "translateX(0)";

        galleryViewerImg.style.opacity =
            "1";

        galleryViewerImgNext.style.opacity =
            "0";

        galleryViewerImg.classList.remove("animating");
        galleryViewerImgNext.classList.remove("animating");

        swipeCurrentX = 0;

        resetZoom();

        isAnimating = false;

        preloadNearbyImages(currentIndex);

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
// 두 손가락 거리 계산
// ==================================================

function getTouchDistance(touch1, touch2) {

    const dx =
        touch2.clientX - touch1.clientX;

    const dy =
        touch2.clientY - touch1.clientY;

    return Math.sqrt(
        dx * dx + dy * dy
    );

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


            // ------------------------------------------
            // 두 손가락 → 핀치 시작
            // ------------------------------------------

            if (event.touches.length === 2) {

                // 핀치 동작 시작

                wasPinching = true;

                // 기존 한 손가락 제스처 무효화
                isDragging = false;
                swipeCurrentX = 0;

                // 핀치 시작 시 두 손가락 사이 거리 저장

                pinchStartDistance =
                    getTouchDistance(
                        event.touches[0],
                        event.touches[1]
                    );

                pinchStartScale = scale;

                // 두 손가락 사이 중심점 계산

                pinchCenterX =
                    (
                        event.touches[0].clientX +
                        event.touches[1].clientX
                    ) / 2;

                pinchCenterY =
                    (
                        event.touches[0].clientY +
                        event.touches[1].clientY
                    ) / 2;

                // 현재 이미지의 화면 중심

                const viewerRect =
                    galleryViewer.getBoundingClientRect();

                const imageCenterX =
                    viewerRect.left +
                    viewerRect.width / 2;

                const imageCenterY =
                    viewerRect.top +
                    viewerRect.height / 2;


                // --------------------------------------------------
                // 핀치 중심점에 대응하는
                // 이미지 내부 좌표를 저장
                //
                // 이후 확대 배율이 바뀌더라도
                // 이 지점이 손가락 중심 아래에 있도록 유지
                // --------------------------------------------------

                pinchLocalX =
                    (
                        pinchCenterX -
                        imageCenterX -
                        translateX
                    ) / scale;

                pinchLocalY =
                    (
                        pinchCenterY -
                        imageCenterY -
                        translateY
                    ) / scale;

                
                // 기존 스와이프 시작 좌표도
                // 핀치 중심점 기준으로 맞춰둠

                touchStartX = pinchCenterX;
                touchStartY = pinchCenterY;
            }


            // ------------------------------------------
            // 한 손가락
            // ------------------------------------------
            
            // 핀치가 끝나기 전까지는
            // 한 손가락 pan/swipe로 전환하지 않음
            if (event.touches.length !== 1 || wasPinching) {
                return;
            }
            
            touchStartX =
                event.touches[0].clientX;
            
            touchStartY =
                event.touches[0].clientY;
            
            touchCurrentX =
                touchStartX;
            
            touchCurrentY =
                touchStartY;
            
            isDragging = true;


            // ------------------------------------------
            // 확대 상태
            // ------------------------------------------

            if (scale > 1) {

                panStartX =
                    event.touches[0].clientX;

                panStartY =
                    event.touches[0].clientY;

                panStartTranslateX =
                    translateX;

                panStartTranslateY =
                    translateY;

            }


            galleryViewerImg.classList.remove(
                "animating"
            );

            galleryViewerImgNext.classList.remove(
                "animating"
            );

        },
        {
            passive: true
        }
    );

}


// ==================================================
// 터치 이동
// ==================================================

if (galleryViewer) {

    galleryViewer.addEventListener(
        "touchmove",
        event => {

            if (isAnimating) {
                return;
            }


            // ==================================================
            // 핀치 줌
            // ==================================================

            if (event.touches.length === 2) {

                if (!pinchStartDistance) {
                    return;
                }


                // --------------------------------------------------
                // 현재 두 손가락 사이 거리 계산
                // --------------------------------------------------

                const currentDistance =
                    getTouchDistance(
                        event.touches[0],
                        event.touches[1]
                    );


                // --------------------------------------------------
                // 핀치 확대 비율 계산
                // --------------------------------------------------

                const ratio =
                    currentDistance /
                    pinchStartDistance;


                // --------------------------------------------------
                // 현재 확대 배율 계산
                // --------------------------------------------------

                const newScale =
                    Math.max(
                        MIN_SCALE,
                        Math.min(
                            MAX_SCALE,
                            pinchStartScale * ratio
                        )
                    );


                // --------------------------------------------------
                // 새로운 배율 적용
                // --------------------------------------------------

                scale = newScale;


                // --------------------------------------------------
                // 핀치 중심점에 있던 이미지 위치가
                // 계속 손가락 중심 아래에 있도록 translation 보정
                // --------------------------------------------------

                const viewerRect =
                    galleryViewer.getBoundingClientRect();

                const imageCenterX =
                    viewerRect.left +
                    viewerRect.width / 2;

                const imageCenterY =
                    viewerRect.top +
                    viewerRect.height / 2;


                if (scale > MIN_SCALE) {

                    translateX =
                        pinchCenterX -
                        imageCenterX -
                        pinchLocalX * scale;

                    translateY =
                        pinchCenterY -
                        imageCenterY -
                        pinchLocalY * scale;

                } else {

                    translateX = 0;
                    translateY = 0;

                }


                // --------------------------------------------------
                // 확대된 이미지가 화면 밖으로
                // 무한정 이동하지 않도록 제한
                // --------------------------------------------------

                const width =
                    galleryViewer.offsetWidth;

                const height =
                    galleryViewer.offsetHeight;

                const maxX =
                    width * (scale - 1) / 2;

                const maxY =
                    height * (scale - 1) / 2;


                translateX =
                    Math.max(
                        -maxX,
                        Math.min(
                            maxX,
                            translateX
                        )
                    );

                translateY =
                    Math.max(
                        -maxY,
                        Math.min(
                            maxY,
                            translateY
                        )
                    );



                // --------------------------------------------------
                // 이미지 transform 적용
                // --------------------------------------------------

                updateImageTransform();

                return;

            }


            // ==================================================
            // 한 손가락
            // ==================================================

            if (
                !isDragging ||
                event.touches.length !== 1
            ) {
                return;
            }


            touchCurrentX =
                event.touches[0].clientX;

            touchCurrentY =
                event.touches[0].clientY;


            // ==================================================
            // 확대 상태 → 이미지 이동
            // ==================================================

            if (scale > 1) {

                const moveX =
                    event.touches[0].clientX -
                    panStartX;

                const moveY =
                    event.touches[0].clientY -
                    panStartY;


                translateX =
                    panStartTranslateX + moveX;

                translateY =
                    panStartTranslateY + moveY;


                // --------------------------------------------------
                // 확대 이미지가 화면 밖으로 너무 이동하지 않도록 제한
                // --------------------------------------------------

                const width =
                    galleryViewer.offsetWidth;

                const height =
                    galleryViewer.offsetHeight;

                const maxX =
                    width * (scale - 1) / 2;

                const maxY =
                    height * (scale - 1) / 2;


                translateX =
                    Math.max(
                        -maxX,
                        Math.min(
                            maxX,
                            translateX
                        )
                    );

                translateY =
                    Math.max(
                        -maxY,
                        Math.min(
                            maxY,
                            translateY
                        )
                    );


                updateImageTransform();

                return;

            }


            // ==================================================
            // 기본 상태 → 기존 좌우 스와이프
            // ==================================================

            const diff =
                touchCurrentX -
                touchStartX;


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


            swipeCurrentX = limitedDiff;


            // 현재 사진 이동

            galleryViewerImg.style.transform =
                `translate3d(${limitedDiff}px, 0, 0)`;


            // --------------------------------------------------
            // 왼쪽으로 스와이프
            // --------------------------------------------------

            if (limitedDiff < 0) {

                const nextIndex =
                    (currentIndex + 1) %
                    galleryImages.length;


                // 다음 이미지가 아직 캐시에 없다면 로딩 시작

                preloadImage(nextIndex);


                const nextSrc =
                    galleryImages[nextIndex].dataset.full;


                if (
                    galleryViewerImgNext.src !== nextSrc
                ) {

                    galleryViewerImgNext.src =
                        nextSrc;

                }


                galleryViewerImgNext.style.transform =
                    `translate3d(${width + limitedDiff}px, 0, 0)`;

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
                    ) % galleryImages.length;


                // 이전 이미지가 아직 캐시에 없다면 로딩 시작

                preloadImage(prevIndex);


                const prevSrc =
                    galleryImages[prevIndex].dataset.full;


                if (
                    galleryViewerImgNext.src !== prevSrc
                ) {

                    galleryViewerImgNext.src =
                        prevSrc;

                }


                galleryViewerImgNext.style.transform =
                    `translateX(${-width + limitedDiff}px)`;

            }

        },
        {
            passive: true
        }
    );

}


// ==================================================
// 터치 종료
// ==================================================

if (galleryViewer) {

    galleryViewer.addEventListener(
        "touchend",
        event => {

            if (isAnimating) {
                return;
            }


            // ------------------------------------------
            // 핀치 종료
            // ------------------------------------------

            if (event.touches.length > 0) {
                return;
            }


            pinchStartDistance = 0;


            // ==================================================
            // 핀치 종료 후 줌다운 → 중앙 복귀
            // ==================================================

            if (wasPinching) {

                wasPinching = false;
            
                // 핀치 종료 후 남아 있는
                // 한 손가락 이동 상태를 완전히 제거
                isDragging = false;
            
                touchStartX = 0;
                touchStartY = 0;
                touchCurrentX = 0;
                touchCurrentY = 0;
            
                panStartX = 0;
                panStartY = 0;
            
                panStartTranslateX = translateX;
                panStartTranslateY = translateY;
            
                swipeCurrentX = 0;
            
                if (scale <= MIN_SCALE) {
            
                    centerImage();
            
                }
            
                return;
            
            }

            if (!isDragging) {
                return;
            }


            isDragging = false;


            // ==================================================
            // 확대 상태
            // ==================================================

            if (scale > 1) {

                // 확대 상태에서는 이미지가
                // 화면 밖으로 너무 벗어나지 않도록 제한

                const width =
                    galleryViewer.offsetWidth;

                const height =
                    galleryViewer.offsetHeight;

                const maxX =
                    width * (scale - 1) / 2;

                const maxY =
                    height * (scale - 1) / 2;


                translateX =
                    Math.max(
                        -maxX,
                        Math.min(
                            maxX,
                            translateX
                        )
                    );

                translateY =
                    Math.max(
                        -maxY,
                        Math.min(
                            maxY,
                            translateY
                        )
                    );


                updateImageTransform();

                return;

            }


            // ==================================================
            // 기본 상태 → 사진 스와이프
            // ==================================================

            const diff =
                touchCurrentX -
                touchStartX;


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

