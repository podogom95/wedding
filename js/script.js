history.scrollRestoration = "manual";

window.addEventListener("load", () => {
    window.scrollTo(0, 0);
});

document.querySelectorAll('.accordion')
.forEach(btn=>{

    btn.addEventListener('click',()=>{

        const panel=btn.nextElementSibling;

        if(panel.style.display==='block'){
            panel.style.display='none';
        }else{
            panel.style.display='block';
        }
    });
});

function copyText(text){

    navigator.clipboard.writeText(text);

    //alert('계좌번호가 복사되었습니다.');
}

// document.querySelectorAll('.gallery-img')
// .forEach(img=>{

//     img.addEventListener('click',()=>{

//         basicLightbox.create(
//             `<img src="${img.src}" style="max-width:90vw;">`
//         ).show();

//     });

// });
//갤러리 스타일 수정
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
let isSwiping = false;

let savedScrollY = 0;


// 갤러리 열기
function openGallery(index) {

    currentIndex = index;

    galleryViewerImg.src = galleryImages[currentIndex].src;

    galleryViewer.classList.add('active');

    galleryOpen = true;


    // 현재 청첩장의 스크롤 위치 저장
    savedScrollY = window.scrollY;

    // iOS에서도 배경 스크롤 방지
    document.body.classList.add('gallery-open');


    // 브라우저 history에 갤러리 상태 추가
    history.pushState(
        { gallery: true },
        "",
        window.location.href
    );
}


// 갤러리 닫기
function closeGallery() {

    galleryViewer.classList.remove('active');

    galleryOpen = false;

    document.body.classList.remove('gallery-open');

    // 기존 스크롤 위치 복원
    window.scrollTo(0, savedScrollY);
}

// 사진 변경
function showImage(index) {

    if (index < 0) {
        index = galleryImages.length - 1;
    }

    if (index >= galleryImages.length) {
        index = 0;
    }

    currentIndex = index;

    galleryViewerImg.src = galleryImages[currentIndex].src;
}


// 사진 클릭
galleryImages.forEach((img, index) => {

    img.addEventListener('click', () => {
        openGallery(index);
    });

});


// 이전 사진
prevButton.addEventListener('click', (e) => {

    e.stopPropagation();

    showImage(currentIndex - 1);

});


// 다음 사진
nextButton.addEventListener('click', (e) => {

    e.stopPropagation();

    showImage(currentIndex + 1);

});


// X 버튼
closeButton.addEventListener('click', (e) => {

    e.stopPropagation();

    if (galleryOpen) {
        history.back();
    }

});


// 브라우저 뒤로가기
window.addEventListener('popstate', () => {

    if (galleryOpen) {
        closeGallery();
    }

});

// =========================
// 스와이프 시작
// =========================

galleryViewer.addEventListener('touchstart', (e) => {

    if (e.touches.length !== 1) {
        return;
    }

    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;

    isSwiping = false;

}, { passive: true });


// =========================
// 스와이프 종료
// =========================

galleryViewer.addEventListener('touchend', (e) => {

    if (e.changedTouches.length !== 1) {
        return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;


    // 세로 움직임보다 가로 움직임이 크고
    // 50px 이상 움직였을 때만 스와이프
    if (
        Math.abs(diffX) > 50 &&
        Math.abs(diffX) > Math.abs(diffY)
    ) {

        isSwiping = true;


        if (diffX > 0) {

            // 왼쪽으로 스와이프
            showImage(currentIndex + 1);

        } else {

            // 오른쪽으로 스와이프
            showImage(currentIndex - 1);

        }

    }

}, { passive: true });


// 바깥 영역 클릭 → 닫기
galleryViewer.addEventListener('click', (e) => {

    // 스와이프 직후 발생하는 가짜 click 방지
    if (isSwiping) {
        isSwiping = false;
        return;
    }

    // 실제 배경을 클릭했을 때만 닫기
    if (e.target === galleryViewer) {

        if (galleryOpen) {
            history.back();
        }

    }

});

const observer = new IntersectionObserver(
    (entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                entry.target.classList.add('show');

            } else {
                // 화면에서 벗어나면 페이드 아웃
                entry.target.classList.remove('show');
            }

        });

    },
    {
        threshold: 0
    }
);

document.querySelectorAll('.card')
.forEach(el=>observer.observe(el));
