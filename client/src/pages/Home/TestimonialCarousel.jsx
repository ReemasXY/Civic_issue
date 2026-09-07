import React from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import ScrollReveal from "../../utils/ScrollReveal";
import {
  Autoplay,
  Navigation,
  Pagination,
} from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const testimonials = [
  {
    name: "Suman Shrestha",
    role: "Resident, Baneshwor",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    message:
      "I reported a large pothole near my neighborhood, and the issue was verified and forwarded to the concerned authority. It was resolved within a few days.",
    rating: 5,
  },
  {
    name: "Anisha Maharjan",
    role: "Teacher, Lalitpur",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    message:
      "The platform makes reporting local problems really simple. I can submit an issue and easily check its progress without visiting an office.",
    rating: 5,
  },
  {
    name: "Prakash Tamang",
    role: "Business Owner, Kalanki",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    message:
      "I reported an overflowing garbage collection point in my area. The response was quick, and the status updates made the whole process transparent.",
    rating: 5,
  },
  {
    name: "Rojina Gurung",
    role: "Student, Kirtipur",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    message:
      "It feels good to have a platform where citizens can raise issues that affect everyday life. Reporting a broken street light was quick and easy.",
    rating: 5,
  },
  {
    name: "Bibek Karki",
    role: "Resident, Koteshwor",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    message:
      "I really like being able to track my complaint after submitting it. It gives citizens confidence that their concerns are actually being addressed.",
    rating: 5,
  },
  {
    name: "Nisha Shakya",
    role: "Entrepreneur, Patan",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    message:
      "A simple platform like this can make a real difference in our communities. It makes civic participation much easier and more accessible.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-16 sm:py-16">
      <div className="mx-auto max-w-[1150px] px-8 sm:px-8">

        {/* =========================
            HEADER
        ========================== */}
        <div className="mb-12 text-center">

          <div className="flex items-center justify-center gap-4">
            <span className="h-[2px] w-10 bg-teal-600" />

            <span
              className="
                text-[13px]
                font-semibold
                tracking-[2.5px]
                text-teal-600
                sm:text-[14px]
              "
            >
              CITIZEN VOICES
            </span>

            <span className="h-[2px] w-10 bg-teal-600" />
          </div>

          <h2
            className="
              mt-6
              text-center
              text-[42px]
              font-bold
              leading-[1.1]
              tracking-[-1.5px]
              text-[#14233B]
              sm:text-[48px]
              lg:text-[52px]
            "
          >
            <ScrollReveal
              baseOpacity={0.1}
              enableBlur
              baseRotation={3}
              blurStrength={4}
            >

              What Citizens
            </ScrollReveal>

            <br />

            <span className="text-teal-600">
              <ScrollReveal
                baseOpacity={0.1}
                enableBlur
                baseRotation={3}
                blurStrength={4}
              >


                Are Saying
              </ScrollReveal>

            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-6
              max-w-[650px]
              text-center
              text-[16px]
              leading-[1.7]
              text-slate-600
              sm:text-[17px]
            "
          >
            <ScrollReveal
              baseOpacity={0.1}
              enableBlur
              baseRotation={3}
              blurStrength={4}
            >

              Real experiences from citizens using our platform
              to report, track, and help resolve civic issues
              in their communities
            </ScrollReveal>

            .
          </p>
        </div>

        {/* =========================
            CAROUSEL
        ========================== */}
        <div className="relative">

          <Swiper
            modules={[
              Autoplay,
              Navigation,
              Pagination,
            ]}

            /*
              IMPORTANT
              -------------
              1 card  = mobile
              2 cards = tablet
              3 cards = desktop
            */
            slidesPerView={1}
            spaceBetween={20}

            loop={true}

            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}

            navigation={{
              nextEl: ".testimonial-next",
              prevEl: ".testimonial-prev",
            }}

            pagination={{
              el: ".testimonial-pagination",
              clickable: true,
            }}

            breakpoints={{
              // Mobile
              0: {
                slidesPerView: 1,
                spaceBetween: 20,
              },

              // Small tablet
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },

              // Desktop
              1024: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
            }}

            className="testimonials-swiper !pb-12"
          >

            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={testimonial.name}>

                <div className="h-full">

                  {/* =========================
                      CARD
                  ========================== */}
                  <div
                    className="
                      group
                      relative
                      flex
                      min-h-[390px]
                      flex-col
                      overflow-hidden
                      rounded-2xl
                      border
                      border-gray-100
                      bg-white
                      p-7
                      shadow-sm
                      transition-all
                      duration-500
                      hover:-translate-y-1
                      hover:shadow-lg
                      sm:p-8
                    "
                  >

                    {/* Quote */}
                    <div
                      className="
                        absolute
                        right-6
                        top-5
                        text-teal-100
                      "
                    >
                      <svg
                        width="34"
                        height="34"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>

                    {/* Profile */}
                    <div className="mb-5 flex justify-center">

                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="
                          h-20
                          w-20
                          rounded-full
                          border-4
                          border-teal-50
                          object-cover
                          ring-2
                          ring-teal-500/20
                        "
                      />

                    </div>

                    {/* Stars */}
                    <div className="mb-4 flex justify-center gap-1">

                      {[...Array(5)].map((_, index) => (
                        <svg
                          key={index}
                          className={`
                            h-4
                            w-4
                            ${index < testimonial.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                            }
                          `}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}

                    </div>

                    {/* Message */}
                    <div className="flex flex-1 items-center">

                      <p
                        className="
                          w-full
                          text-center
                          text-[15px]
                          leading-[1.7]
                          text-slate-600
                          sm:text-[16px]
                        "
                      >
                        "{testimonial.message}"
                      </p>

                    </div>

                    {/* User */}
                    <div className="mt-6 text-center">

                      <h3
                        className="
                          text-[17px]
                          font-bold
                          text-[#14233B]
                        "
                      >
                        {testimonial.name}
                      </h3>

                      <p
                        className="
                          mt-1
                          text-sm
                          font-medium
                          text-teal-600
                        "
                      >
                        {testimonial.role}
                      </p>

                    </div>

                    {/* Bottom decoration */}
                    <div
                      className="
                        absolute
                        bottom-0
                        left-0
                        h-16
                        w-16
                        rounded-bl-2xl
                        rounded-tr-2xl
                        bg-teal-50/70
                        transition-all
                        duration-300
                        group-hover:h-20
                        group-hover:w-20
                      "
                    />

                  </div>

                </div>

              </SwiperSlide>
            ))}

          </Swiper>

          {/* =========================
              PREVIOUS BUTTON
          ========================== */}
          <button
            className="
              testimonial-prev
              cursor-pointer
              absolute
              left-0
              top-1/2
              z-20
              flex
              h-10
              w-10
              -translate-x-1/2
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              bg-teal-600
              text-white
              shadow-md
              transition-all
              duration-300
              hover:bg-teal-700
              hover:scale-105
              sm:h-11
              sm:w-11
            "
            aria-label="Previous testimonial"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* =========================
              NEXT BUTTON
          ========================== */}
          <button
            className="
              testimonial-next
              cursor-pointer
              absolute
              right-0
              top-1/2
              z-20
              flex
              h-10
              w-10
              translate-x-1/2
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              bg-teal-600
              text-white
              shadow-md
              transition-all
              duration-300
              hover:bg-teal-700
              hover:scale-105
              sm:h-11
              sm:w-11
            "
            aria-label="Next testimonial"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

        </div>

        {/* =========================
            PAGINATION
        ========================== */}
        <div
          className="
            testimonial-pagination
            mt-5
            flex
            justify-center
            gap-2
          "
        />

      </div>

      {/* =========================
          SWIPER CUSTOM CSS
      ========================== */}
      <style>
        {`
          .testimonial-pagination
          .swiper-pagination-bullet {
            width: 8px;
            height: 8px;
            background: #cbd5e1;
            opacity: 1;
            transition: all 0.3s ease;
          }

          .testimonial-pagination
          .swiper-pagination-bullet-active {
            width: 28px;
            border-radius: 999px;
            background: #0d9488;
          }

          .testimonial-prev.swiper-button-disabled,
          .testimonial-next.swiper-button-disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .testimonials-swiper {
            width: 100%;
          }

          .testimonials-swiper
          .swiper-slide {
            height: auto;
          }
        `}
      </style>

    </section>
  );
};

export default Testimonials;