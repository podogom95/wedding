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

document.querySelectorAll('.gallery-img')
.forEach(img=>{

    img.addEventListener('click',()=>{

        basicLightbox.create(
            `<img src="${img.src}" style="max-width:90vw;">`
        ).show();

    });

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
