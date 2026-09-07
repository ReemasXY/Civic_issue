

import {FaArrowRight} from "react-icons/fa"; 

export default function Banner() {
    return (
        <section className="max-w-[1150px] mx-auto px-4 sm:px-6 lg:px-8 py-14">

            <div className="rounded-3xl bg-slate-900 px-6 sm:px-10 py-10 sm:py-12 flex flex-col md:flex-row items-center justify-between gap-8">

                <div className="text-center md:text-left">

                    <p className="text-sm font-semibold text-slate-400 mb-2">
                        MAKE A DIFFERENCE
                    </p>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                        See an issue in your community?
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        Report it and help make your city a better place.
                    </p>

                </div>

                <button className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100">
                    Report an Issue
                    <FaArrowRight size={12} />
                </button>

            </div>

        </section>
    );
}