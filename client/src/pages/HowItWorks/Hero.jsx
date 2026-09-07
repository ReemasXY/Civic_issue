import BlurText from "../../utils/Blurtext";

export default function Hero() {
    return (
        <section className="max-w-[1150px] mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-20">
            <div className="max-w-3xl mx-auto text-center">

                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold tracking-wide text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 " />
                    HOW IT WORKS
                </span>

                <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
                    <BlurText
                        text= {` From Reporting an Issue`}
                        delay={200}
                        animateBy="words"
                        direction="top"
                        className="justify-center"
                    
                    />

                    <BlurText
                        text= {`To Getting It Fixed`}
                        delay={200}
                        animateBy="words"
                        direction="top"
                        className="text-teal-600 justify-center mt-4"
                    
                    />
                   
                </h1>

                <p className="mt-5 max-w-2xl mx-auto text-slate-500 leading-relaxed text-sm sm:text-base">
                    CivicCare connects citizens with the right authorities to make
                    reporting, tracking, and resolving civic issues simple and
                    transparent.
                </p>

            </div>
        </section>
    );
}