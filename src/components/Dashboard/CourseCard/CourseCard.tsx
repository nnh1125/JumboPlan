'use client'

/**
 * Add component description
 * @author Allison Zhang
 */

// Import React
import React, { useReducer, useEffect } from 'react';

// Import types
import Course from '../../../types/Course';
import CourseCardTag from './CourseCardTag';



/*------------------------------------------------------------------------*/
/* -------------------------------- Types ------------------------------- */
/*------------------------------------------------------------------------*/

// Props definition
type Props = (
  | {
    // Whether the card is empty (i.e. not associated with any course)
    empty: false;
    // Course associated with the card.
    course: Course,
    // Handler for when the user manipulates the course associated with the card
    onCourseChange: (course: Course) => void,
    // Handler for when the user clicks the card
    onClick: () => void,
  }
  | {
    // Whether the card is empty (i.e. not associated with any course)
    empty: true;
  }
);

/*------------------------------------------------------------------------*/
/* ------------------------------ Component ----------------------------- */
/*------------------------------------------------------------------------*/

const CourseCard: React.FC<Props> = (props) => {
  /*------------------------------------------------------------------------*/
  /* -------------------------------- Setup ------------------------------- */
  /*------------------------------------------------------------------------*/

  /* -------------- Props ------------- */

  const {
    empty,
  } = props;


  /*------------------------------------------------------------------------*/
  /* ------------------------------- Render ------------------------------- */
  /*------------------------------------------------------------------------*/

  /*----------------------------------------*/
  /* ---------------- Views --------------- */
  /*----------------------------------------*/

  // Body that will be filled with the current view
  let body: React.ReactNode;

  /* -------- AddFirstViewName -------- */

  if (empty) {
    // Create body
    body = (
      <div className='h-50 w-62.5 border-dashed border border-[#D9D9D9] rounded-[15px]'>
        &nbsp;
      </div>
    );
  }

  /* -------- AddSecondViewName -------- */

  if (!empty) {
    if (props.course.started) {
      // Create body
      body = (
        <div className='h-50 w-62.5 border border-[#D9D9D9] border-solid rounded-[15px] bg-[#D7F1C5] select-none flex flex-col justify-between p-3.5'>
          <div className='leading-8 CourseCard-id font-semibold text-[#5C4C4C]'>
            {props.course.title || props.course.id}
          </div>
          <div className='CourseCard-misc-info pb-4 text-green-700'>
            ✔ Completed!
          </div>
          <div className='flex CourseCard-tags justify-end gap-2'>
            {props.course.tags && props.course.tags.map((tag) => (
              <CourseCardTag tag={tag} key={tag} />
            ))}
          </div>
        </div>
      );
    } else {
      // Create body
      body = (
        <div className={`h-50 w-62.5 border border-[#D9D9D9]
                        border-solid rounded-[15px] 
                       ${props.course.eligible ? 'bg-[#E3F1F9]' : 'bg-[#E3E3E3]'} 
                        select-none flex flex-col justify-between p-3.5`}>
          <div className={`leading-8 CourseCard-id font-semibold ${props.course.eligible ? 'text-[#5C4C4C]' : 'text-black'}`}>
            {props.course.title || props.course.id}
          </div>
          <div className='pb-4'>
            <div className='CourseCard-misc-info'>
              🔄 Not Started
            </div>
            <div className='CourseCard-misc-info'>
              {props.course.eligible ? '🔑 Eligible' : '🔒 Locked'}
            </div>
          </div>
          <div className='flex CourseCard-tags justify-end gap-2'>
            {props.course.tags && props.course.tags.map((tag) => (
              <CourseCardTag tag={tag} key={tag} />
            ))}
          </div>
        </div>
      );
    };
  }

  /*----------------------------------------*/
  /* --------------- Main UI -------------- */
  /*----------------------------------------*/

  return (
    <div
      className='select-none cursor-pointer'
      onClick={!empty && 'onClick' in props ? props.onClick : undefined}
      role={!empty ? 'button' : undefined}
      tabIndex={!empty ? 0 : undefined}
      onKeyDown={
        !empty && 'onClick' in props
          ? (e) => e.key === 'Enter' && props.onClick?.()
          : undefined
      }
    >
      {body}
    </div>
  );
};

/*------------------------------------------------------------------------*/
/* ------------------------------- Wrap Up ------------------------------ */
/*------------------------------------------------------------------------*/

// Export component
export default CourseCard;

