import React, { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

const SharedLayout = () => {
  return (
    <>
      <Suspense fallback={<div>loading ....</div>}>
        <Outlet />
      </Suspense>
    </>
  )
}

export default SharedLayout
