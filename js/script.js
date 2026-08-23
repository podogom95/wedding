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


// 갤러리 열기
function openGallery(index) {

    currentIndex = index;

    galleryViewerImg.src = galleryImages[currentIndex].src;

    galleryViewer.classList.add('active');

    galleryOpen = true;

    // 브라우저 뒤로가기용 history 추가
    history.pushState({ gallery: true }, "");

}


// 갤러리 닫기
function closeGallery() {

    galleryViewer.classList.remove('active');

    galleryOpen = false;
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
closeButton.addEventListener('click', () => {

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

let touchStartX = 0;
let touchEndX = 0;

galleryViewer.addEventListener('touchstart', (e) => {

    touchStartX = e.changedTouches[0].screenX;

}, { passive: true });


galleryViewer.addEventListener('touchend', (e) => {

    touchEndX = e.changedTouches[0].screenX;

    const difference = touchStartX - touchEndX;

    // 최소 50px 이상 움직였을 때만 스와이프
    if (Math.abs(difference) < 50) {
        return;
    }

    if (difference > 0) {
        // 왼쪽으로 스와이프 → 다음
        showImage(currentIndex + 1);
    } else {
        // 오른쪽으로 스와이프 → 이전
        showImage(currentIndex - 1);
    }

});

galleryViewer.addEventListener('click', (e) => {

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
