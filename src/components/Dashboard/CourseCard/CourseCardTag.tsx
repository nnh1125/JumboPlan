'use client'

/**
 * Add component description
 * @author Allison Zhang
 */

// Import React
import React from 'react';

// Import types
import CourseTag from '@/types/CourseTag';


/*------------------------------------------------------------------------*/
/* -------------------------------- Types ------------------------------- */
/*------------------------------------------------------------------------*/

// Props definition
type Props = {
  tag: CourseTag;
};

/*------------------------------------------------------------------------*/
/* ------------------------------ Component ----------------------------- */
/*------------------------------------------------------------------------*/

const CourseCardTag: React.FC<Props> = (props) => {
  /*------------------------------------------------------------------------*/
  /* -------------------------------- Setup ------------------------------- */
  /*------------------------------------------------------------------------*/

  /* -------------- Props ------------- */

  const {
    tag,
  } = props;

  /*------------------------------------------------------------------------*/
  /* ------------------------------- Render ------------------------------- */
  /*------------------------------------------------------------------------*/

  /*----------------------------------------*/
  /* ---------------- Views --------------- */
  /*----------------------------------------*/

  // Body that will be filled with the current view
  let body: React.ReactNode;

  switch (tag) {
    case CourseTag.M:
      body = (
        <span className='CourseCard-tag bg-[#FE959E] p-2 rounded-[999px]'>
          M
        </span>
      );
      break;
    case CourseTag.E:
      body = (
        <span className='CourseCard-tag bg-[#82CDEA] p-2 rounded-[999px]'>
          E
        </span>
      );
      break;
    case CourseTag.C:
      body = (
        <span className='CourseCard-tag bg-[#5E94CE] p-2 rounded-[999px]'>
          C
        </span>
      );
      break;
    case CourseTag.HASS:
      body = (
        <span className='CourseCard-tag bg-[#EEBE4F] p-2 rounded-[999px]'>
          HASS
        </span>
      );
      break;
    case CourseTag.NS:
      body = (
        <span className='CourseCard-tag bg-[#BAC55C] p-2 rounded-[999px]'>
          NS
        </span>
      );
      break;
    default:
      body = null;
  };

  /*----------------------------------------*/
  /* --------------- Main UI -------------- */
  /*----------------------------------------*/

  return (
    <span className='select-none text-[#5C4C4C]'>
      {/* Add Body */}
      {body}
    </span>
  );
};

/*------------------------------------------------------------------------*/
/* ------------------------------- Wrap Up ------------------------------ */
/*------------------------------------------------------------------------*/

// Export component
export default CourseCardTag;
